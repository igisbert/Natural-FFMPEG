const GEMINI_ERRORS = {
  400: "La petición tiene un formato incorrecto. Revisa tu entrada.",
  401: "API Key no válida. Por favor, revisa tu configuración.",
  403: "Acceso denegado. Tu API Key no tiene permiso para usar este modelo.",
  404: "El modelo seleccionado no está disponible en tu región o no existe.",
  429: "Límite de cuota excedido. Has hecho demasiadas peticiones, espera un minuto.",
  500: "Error interno de Google. Los servidores de Gemini están teniendo problemas.",
  503: "Servicio no disponible. El servidor está sobrecargado en este momento.",
  "NETWORK_ERROR": "No se pudo conectar con los servidores de Google. Revisa tu conexión.",
  "SAFETY": "La petición fue bloqueada por los filtros de seguridad de Gemini.",
  "UNKNOWN": "Ha ocurrido un error inesperado al contactar con Gemini."
};

export const translateGeminiError = (errorString) => {
  if (!errorString) return GEMINI_ERRORS.UNKNOWN;

  // Intentar extraer el código de estado si viene en el string del error de Rust
  // Ej: "Gemini API error: 429 Too Many Requests..."
  const statusMatch = errorString.match(/(\d{3})/);
  if (statusMatch) {
    const code = statusMatch[1];
    if (GEMINI_ERRORS[code]) return GEMINI_ERRORS[code];
  }

  if (errorString.toLowerCase().includes("safety")) return GEMINI_ERRORS.SAFETY;
  if (errorString.toLowerCase().includes("fetch") || errorString.toLowerCase().includes("network")) return GEMINI_ERRORS.NETWORK_ERROR;

  return GEMINI_ERRORS.UNKNOWN;
};
