#!/usr/bin/env node
/**
 * generate-embeddings.js
 *
 * Genera embeddings para todos los filtros de FFmpeg usando Gemini API.
 * Guarda la caché en embeddings-cache.json para uso rápido en Rust.
 *
 * Uso:
 *   GEMINI_API_KEY=tu_clave node generate-embeddings.js
 *
 * Salida:
 *   src-tauri/src/docs/embeddings-cache.json
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Error: GEMINI_API_KEY no definida");
  console.error("Uso: GEMINI_API_KEY=tu_clave node generate-embeddings.js");
  process.exit(1);
}

const DOCS_DIR = join(import.meta.dirname, "./src-tauri/src/docs");
const OUTPUT_FILE = join(DOCS_DIR, "embeddings-cache.json");
const EMBEDDING_MODEL = "gemini-embedding-2";
const BATCH_SIZE = 25; // Reducido para evitar rate limits
const DELAY_BETWEEN_BATCHES = 3500; // 3.5 segundos entre batches (100 req/min = 1.67 req/s)

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getEmbeddingWithRetry(text, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await getEmbedding(text);
    } catch (error) {
      if (error.message.includes("429") && attempt < retries - 1) {
        const delay = 60000; // 60 segundos para rate limit
        console.log(`\n  Rate limit alcanzado, esperando ${delay/1000}s...`);
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }
}

async function getEmbeddingsBatchWithRetry(texts, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await getEmbeddingsBatch(texts);
    } catch (error) {
      if (error.message.includes("429") && attempt < retries - 1) {
        const delay = 60000; // 60 segundos para rate limit
        console.log(`\n  Rate limit alcanzado, esperando ${delay/1000}s...`);
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }
}

async function getEmbedding(text) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text }] },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  return data.embedding.values;
}

async function getEmbeddingsBatch(texts) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:batchEmbedContents?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: texts.map((text) => ({
          model: `models/${EMBEDDING_MODEL}`,
          content: { parts: [{ text }] },
        })),
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  return data.embeddings.map((e) => e.values);
}

function loadAllFilters() {
  const files = readdirSync(DOCS_DIR).filter(
    (f) => f.startsWith("filtros_") && f.endsWith(".json")
  );

  const filters = [];

  for (const file of files) {
    const filePath = join(DOCS_DIR, file);
    const content = readFileSync(filePath, "utf-8");
    const items = JSON.parse(content);

    for (const item of items) {
      filters.push({
        id: item.id,
        io: item.io,
        file: file,
        resumen: item.resumen,
        // Texto para embedding: resumen + primeras líneas del detalle
        texto_embedding: `${item.resumen}\n${item.texto.slice(0, 300)}`,
      });
    }
  }

  return filters;
}

async function main() {
  console.log("Cargando filtros...");
  const filters = loadAllFilters();
  console.log(`Encontrados ${filters.length} filtros`);

  console.log("Generando embeddings (esto puede tardar unos minutos)...");
  const embeddings = [];
  const startTime = Date.now();

  for (let i = 0; i < filters.length; i += BATCH_SIZE) {
    const batch = filters.slice(i, i + BATCH_SIZE);
    const batchTexts = batch.map((f) => f.texto_embedding);

    const progress = Math.min(i + BATCH_SIZE, filters.length);
    const percent = ((progress / filters.length) * 100).toFixed(1);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    process.stdout.write(
      `\r[${progress}/${filters.length}] ${percent}% - ${elapsed}s elapsed `
    );

    try {
      const batchEmbeddings = await getEmbeddingsBatchWithRetry(batchTexts);

      for (let j = 0; j < batch.length; j++) {
        embeddings.push({
          id: batch[j].id,
          io: batch[j].io,
          file: batch[j].file,
          resumen: batch[j].resumen,
          embedding: batchEmbeddings[j],
        });
      }
    } catch (error) {
      console.error(`\nError en batch ${i}: ${error.message}`);
      // Reintentar uno por uno con retry
      for (const item of batch) {
        try {
          const emb = await getEmbeddingsBatchWithRetry([item.texto_embedding]);
          embeddings.push({
            id: item.id,
            io: item.io,
            file: item.file,
            resumen: item.resumen,
            embedding: emb[0],
          });
        } catch (e) {
          console.error(`  Error con ${item.id}: ${e.message}`);
        }
      }
    }

    // Pausa entre batches para respetar rate limits
    if (i + BATCH_SIZE < filters.length) {
      await sleep(DELAY_BETWEEN_BATCHES);
    }
  }

  console.log("\n\nGuardando embeddings-cache.json...");
  writeFileSync(OUTPUT_FILE, JSON.stringify(embeddings, null, 2), "utf-8");

  const sizeKB = (JSON.stringify(embeddings).length / 1024).toFixed(1);
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log(`✅ Listo: ${embeddings.length} embeddings (${sizeKB} KB) en ${totalTime}s`);
}

main().catch(console.error);
