use serde::Deserialize;
use std::fs;
use std::path::Path;
use std::sync::OnceLock;

#[derive(Deserialize)]
pub struct EmbeddingEntry {
    pub id: String,
    #[allow(dead_code)]
    pub io: String,
    pub file: String,
    #[allow(dead_code)]
    pub resumen: String,
    pub embedding: Vec<f32>,
}

static EMBEDDINGS_CACHE: OnceLock<Vec<EmbeddingEntry>> = OnceLock::new();

fn load_embeddings() -> &'static Vec<EmbeddingEntry> {
    EMBEDDINGS_CACHE.get_or_init(|| {
        let docs_dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("src/docs");
        let cache_file = docs_dir.join("embeddings-cache.json");

        println!("[FFmpeg Docs] Cargando embeddings-cache.json...");

        let content = fs::read_to_string(&cache_file)
            .expect("Failed to read embeddings-cache.json. Run `npm run embeddings` first.");

        let cache: Vec<EmbeddingEntry> = serde_json::from_str(&content)
            .expect("Failed to parse embeddings-cache.json");

        println!("[FFmpeg Docs] {} embeddings cargados", cache.len());
        cache
    })
}

fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    let dot_product: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
    let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
    let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();

    if norm_a == 0.0 || norm_b == 0.0 {
        return 0.0;
    }

    dot_product / (norm_a * norm_b)
}

pub async fn get_embedding(text: &str, api_key: &str) -> Result<Vec<f32>, String> {
    let client = reqwest::Client::new();
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key={}",
        api_key
    );

    let body = serde_json::json!({
        "model": "models/gemini-embedding-2",
        "content": {
            "parts": [{ "text": text }]
        }
    });

    let response = client
        .post(&url)
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        let error = response.text().await.map_err(|e| e.to_string())?;
        return Err(format!("Embedding API error: {}", error));
    }

    let data: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;

    let embedding = data["embedding"]["values"]
        .as_array()
        .map(|arr| {
            arr.iter()
                .filter_map(|v| v.as_f64().map(|n| n as f32))
                .collect::<Vec<f32>>()
        })
        .ok_or_else(|| "Invalid embedding response format".to_string())?;

    Ok(embedding)
}

pub async fn search_ffmpeg_docs(query: &str, api_key: &str) -> Result<String, String> {
    println!("[FFmpeg Docs] Buscando docs para: \"{}\"", query);

    let cache = load_embeddings();

    // Get embedding for the query
    let query_embedding = get_embedding(query, api_key).await?;

    // Find the most similar entries
    let mut scored: Vec<(&EmbeddingEntry, f32)> = cache
        .iter()
        .map(|entry| {
            let similarity = cosine_similarity(&query_embedding, &entry.embedding);
            (entry, similarity)
        })
        .collect();

    // Sort by similarity (highest first)
    scored.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

    // Take top 5 most relevant
    let top_n = 5;
    let relevant: Vec<(&EmbeddingEntry, f32)> = scored.iter().take(top_n).map(|(e, s)| (*e, *s)).collect();

    println!("[FFmpeg Docs] Top {} resultados:", top_n);
    for (entry, score) in &relevant {
        println!("  - {} (score: {:.4}): {}", entry.id, score, entry.resumen);
    }

    // Load full filter details from the JSON files
    let docs_dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("src/docs");
    let mut result = Vec::new();

    for (entry, _) in &relevant {
        let file_path = docs_dir.join(&entry.file);
        if let Ok(content) = fs::read_to_string(&file_path) {
            if let Ok(filters) = serde_json::from_str::<Vec<serde_json::Value>>(&content) {
                if let Some(filter) = filters.iter().find(|f| f["id"].as_str() == Some(&entry.id)) {
                    if let Some(texto) = filter["texto"].as_str() {
                        result.push(texto.to_string());
                    }
                }
            }
        }
    }

    println!("[FFmpeg Docs] {} docs inyectados en prompt", result.len());
    Ok(result.join("\n\n---\n\n"))
}
