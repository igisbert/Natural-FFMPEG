import { LazyStore } from "@tauri-apps/plugin-store";

// Usar LazyStore es la forma correcta para este patrón. Carga el almacén
// automáticamente en la primera operación (get, set, etc.).
const store = new LazyStore(".settings.dat");

/**
 * Guarda un valor en la tienda.
 * @param {string} key
 * @param {string} value
 * @returns {Promise<void>}
 */
export async function setSecret(key, value) {
  await store.set(key, value);
  await store.save(); // Guardar cambios en el disco
}

/**
 * Obtiene un valor de la tienda.
 * @param {string} key
 * @returns {Promise<string|null>}
 */
export async function getSecret(key) {
  return await store.get(key);
}

/**
 * Elimina un valor de la tienda.
 * @param {string} key
 * @returns {Promise<void>}
 */
export async function removeSecret(key) {
  await store.delete(key);
  await store.save(); // Guardar cambios en el disco
}

/**
 * Verifica si existe un secreto en la tienda
 * @param {string} key - Clave del secreto
 * @returns {Promise<boolean>} - true si existe, false si no
 */
export async function hasSecret(key) {
  return await store.has(key);
}

// Se mantiene para consistencia con el resto del código
export const SECRET_KEYS = {
  API_TOKEN: "api_token",
  USER_PASSWORD: "user_password",
  REFRESH_TOKEN: "refresh_token",
  GEMINI_API_KEY: "gemini_api_key",
  GEMINI_MODEL: "gemini_model",
  OUTPUT_FOLDER: "output_folder",
  NOTIFICATIONS_ENABLED: "notifications_enabled",
};
