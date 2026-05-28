export const CATEGORIES = {
  VIDEO: "Vídeo",
  AUDIO: "Audio",
  EDIT: "Edición",
  SOCIAL: "Redes Sociales",
  IMAGE: "Imágenes",
  TOOLS: "Herramientas",
};

const presets = [
  {
    title: "Convertir video a MP4",
    description: "Convierte el video a formato MP4 con codec H.264.",
    category: CATEGORIES.VIDEO,
  },
  {
    title: "Convertir video a WebM",
    description: "Convierte el video a formato WebM optimizado para web.",
    category: CATEGORIES.VIDEO,
  },
  {
    title: "Convertir video a AVI",
    description: "Convierte el video a formato AVI.",
    category: CATEGORIES.VIDEO,
  },
  {
    title: "Convertir video a MKV",
    description: "Convierte el video a formato MKV sin pérdida de calidad.",
    category: CATEGORIES.VIDEO,
  },
  {
    title: "Convertir video a MOV",
    description: "Convierte el video a formato MOV (QuickTime).",
    category: CATEGORIES.VIDEO,
  },
  {
    title: "Extraer audio a MP3",
    description: "Extrae el audio del video y lo guarda en formato MP3.",
    category: CATEGORIES.AUDIO,
  },
  {
    title: "Extraer audio a WAV",
    description: "Extrae el audio del video a formato WAV sin compresión.",
    category: CATEGORIES.AUDIO,
  },
  {
    title: "Extraer audio a AAC",
    description: "Extrae el audio del video a formato AAC de alta calidad.",
    category: CATEGORIES.AUDIO,
  },
  {
    title: "Extraer audio a OGG",
    description: "Extrae el audio del video a formato OGG Vorbis.",
    category: CATEGORIES.AUDIO,
  },
  {
    title: "Extraer audio a FLAC",
    description: "Extrae el audio en formato FLAC (alta fidelidad sin pérdida).",
    category: CATEGORIES.AUDIO,
  },
  {
    title: "Eliminar audio del video",
    description: "Elimina completamente la pista de audio del video.",
    category: CATEGORIES.AUDIO,
  },
  {
    title: "Normalizar audio",
    description: "Ajusta el volumen del audio a un nivel estándar.",
    category: CATEGORIES.AUDIO,
  },
  {
    title: "Aumentar volumen del audio",
    description: "Incrementa el volumen del audio del video.",
    category: CATEGORIES.AUDIO,
  },
  {
    title: "Reducir volumen del audio",
    description: "Disminuye el volumen del audio del video.",
    category: CATEGORIES.AUDIO,
  },
  {
    title: "Reducir ruido de audio",
    description: "Elimina o reduce el ruido de fondo del audio.",
    category: CATEGORIES.AUDIO,
  },
  {
    title: "Comprimir video",
    description: "Reduce el tamaño del archivo manteniendo calidad aceptable.",
    category: CATEGORIES.VIDEO,
  },
  {
    title: "Comprimir video al 50%",
    description: "Reduce el tamaño del video aproximadamente a la mitad.",
    category: CATEGORIES.VIDEO,
  },
  {
    title: "Cambiar resolución a 1080p",
    description: "Cambia la resolución del video a 1920x1080 (Full HD).",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Cambiar resolución a 720p",
    description: "Cambia la resolución del video a 1280x720 (HD).",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Cambiar resolución a 480p",
    description: "Cambia la resolución del video a 854x480 (SD).",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Cambiar resolución a 4K",
    description: "Escala el video a resolución 4K (3840x2160).",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Rotar video 90° a la derecha",
    description: "Rota el video 90 grados en sentido horario.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Efecto espejo",
    description: "Duplicar vídeo con efecto espejo.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Rotar video 90° a la izquierda",
    description: "Rota el video 90 grados en sentido antihorario.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Rotar video 180°",
    description: "Voltea el video completamente (180 grados).",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Voltear video horizontalmente",
    description: "Crea un efecto espejo horizontal del video.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Voltear video verticalmente",
    description: "Voltea el video de arriba a abajo.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Extraer fotogramas como imágenes",
    description: "Extrae todos los fotogramas del video como imágenes JPG.",
    category: CATEGORIES.IMAGE,
  },
  {
    title: "Extraer 1 fotograma por segundo",
    description: "Extrae una imagen por cada segundo de video.",
    category: CATEGORIES.IMAGE,
  },
  {
    title: "Capturar miniatura del video",
    description: "Extrae una imagen del primer fotograma como miniatura.",
    category: CATEGORIES.IMAGE,
  },
  {
    title: "Crear GIF del video",
    description: "Convierte el video completo a formato GIF animado.",
    category: CATEGORIES.IMAGE,
  },
  {
    title: "Crear GIF de los primeros 5 segundos",
    description: "Convierte los primeros 5 segundos del video a GIF.",
    category: CATEGORIES.IMAGE,
  },
  {
    title: "Acelerar video 2x",
    description: "Acelera la velocidad del video al doble.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Ralentizar video 0.5x",
    description: "Reduce la velocidad del video a la mitad (cámara lenta).",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Cambiar velocidad a 1.5x",
    description: "Acelera el video a 1.5 veces su velocidad original.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Cambiar FPS a 30",
    description: "Cambia la tasa de fotogramas por segundo a 30 fps.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Cambiar FPS a 60",
    description: "Cambia la tasa de fotogramas por segundo a 60 fps.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Recortar primeros 10 segundos",
    description: "Elimina los primeros 10 segundos del video.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Recortar últimos 10 segundos",
    description: "Elimina los últimos 10 segundos del video.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Extraer segmento específico",
    description: "Extrae una porción del video entre dos tiempos específicos.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Convertir a blanco y negro",
    description: "Elimina el color y convierte el video a escala de grises.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Ajustar brillo del video",
    description: "Aumenta o disminuye el brillo del video.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Aclarar video oscuro",
    description: "Mejora la visibilidad en videos grabados con poca luz.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Ajustar contraste del video",
    description: "Modifica el contraste para mejorar la definición.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Ajustar saturación del video",
    description: "Aumenta o reduce la intensidad de los colores.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Aplicar efecto sepia",
    description: "Aplica un filtro sepia de tonos cálidos al video.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Invertir colores del video",
    description: "Invierte todos los colores creando un efecto negativo.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Difuminar/Desenfocar video",
    description: "Aplica un efecto de desenfoque a todo el video.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Aumentar nitidez del video",
    description: "Mejora la nitidez y los detalles del video.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Añadir efecto vignette",
    description: "Oscurece los bordes del video creando un efecto de viñeta.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Estabilizar video",
    description: "Reduce las vibraciones y estabiliza el video.",
    category: CATEGORIES.TOOLS,
  },
  {
    title: "Cambiar bitrate a alta calidad",
    description: "Aumenta el bitrate para mejorar la calidad del video.",
    category: CATEGORIES.TOOLS,
  },
  {
    title: "Cambiar bitrate a baja calidad",
    description: "Reduce el bitrate para archivos más pequeños.",
    category: CATEGORIES.TOOLS,
  },
  {
    title: "Cambiar codec a H.265/HEVC",
    description: "Recodifica el video con codec H.265 para mejor compresión.",
    category: CATEGORIES.TOOLS,
  },
  {
    title: "Cambiar codec a VP9",
    description: "Recodifica el video con codec VP9 (ideal para web).",
    category: CATEGORIES.TOOLS,
  },
  {
    title: "Recortar/Crop al centro",
    description: "Recorta el video manteniendo centrado el contenido.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Cambiar relación de aspecto a 16:9",
    description: "Ajusta el video a relación de aspecto 16:9.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Cambiar relación de aspecto a 4:3",
    description: "Ajusta el video a relación de aspecto 4:3.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Cambiar relación de aspecto a 1:1 (cuadrado)",
    description: "Convierte el video a formato cuadrado para redes sociales.",
    category: CATEGORIES.SOCIAL,
  },
  {
    title: "Cambiar relación de aspecto a 9:16 (vertical)",
    description: "Convierte el video a formato vertical para móviles.",
    category: CATEGORIES.SOCIAL,
  },
  {
    title: "Añadir padding negro",
    description:
      "Añade bordes negros para ajustar la relación de aspecto sin recortar.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Reproducir video al revés",
    description: "Invierte la reproducción del video de fin a inicio.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Crear bucle del video",
    description: "Repite el video un número determinado de veces.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Extraer solo el primer minuto",
    description: "Extrae únicamente el primer minuto del video.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Desentrelazar video",
    description: "Elimina el entrelazado de videos antiguos o de TV.",
    category: CATEGORIES.TOOLS,
  },
  {
    title: "Optimizar para Instagram",
    description:
      "Optimiza el video para subirlo a Instagram (formato y tamaño).",
    category: CATEGORIES.SOCIAL,
  },
  {
    title: "Optimizar para YouTube",
    description: "Optimiza el video con los mejores ajustes para YouTube.",
    category: CATEGORIES.SOCIAL,
  },
  {
    title: "Optimizar para TikTok",
    description: "Ajusta el video al formato vertical óptimo para TikTok.",
    category: CATEGORIES.SOCIAL,
  },
  {
    title: "Optimizar para Twitter/X",
    description: "Comprime y ajusta el video para cumplir límites de Twitter.",
    category: CATEGORIES.SOCIAL,
  },
  {
    title: "Reducir a menos de 25 MB",
    description: "Comprime el video para que pese menos de 25 MB.",
    category: CATEGORIES.TOOLS,
  },
  {
    title: "Reducir a menos de 100 MB",
    description: "Comprime el video para que pese menos de 100 MB.",
    category: CATEGORIES.TOOLS,
  },
  {
    title: "Eliminar metadata del video",
    description: "Elimina todos los metadatos del archivo de video.",
    category: CATEGORIES.TOOLS,
  },
  {
    title: "Añadir fade in al inicio",
    description: "Añade un fundido de entrada al comienzo del video.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Añadir fade out al final",
    description: "Añade un fundido de salida al final del video.",
    category: CATEGORIES.EDIT,
  },
  {
    title: "Extraer subtítulos del video",
    description: "Extrae los subtítulos incrustados a un archivo separado.",
    category: CATEGORIES.TOOLS,
  },
  {
    title: "Eliminar subtítulos del video",
    description: "Remueve todas las pistas de subtítulos del video.",
    category: CATEGORIES.TOOLS,
  },
  {
    title: "Limpiar pistas (Mantener solo Video/Audio)",
    description: "Elimina todas las pistas de subtítulos y metadatos extras.",
    category: CATEGORIES.TOOLS,
  },
];

export default presets;
