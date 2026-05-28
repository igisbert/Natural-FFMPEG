# Natural FFmpeg

Herramienta de escritorio para procesar archivos multimedia utilizando lenguaje natural. Permite convertir, editar y optimizar archivos de video y audio traduciendo las peticiones del usuario a comandos de FFmpeg a través de la API de Google Gemini.

---

## Funcionalidades principales

- **Procesamiento con IA:** Describe la acción deseada en lenguaje natural y la aplicación generará y ejecutará el comando correspondiente de forma automática.
- **Presets categorizados:** Acceso directo a acciones comunes organizadas por categorías (Video, Audio, Edición, Redes Sociales, Imágenes y Herramientas).
- **Gestión de múltiples archivos:** Soporte para arrastrar y soltar múltiples archivos simultáneamente.
- **Optimización para redes:** Ajustes predefinidos para formatos específicos de Instagram, TikTok, YouTube o Twitter/X.
- **Evitar conflictos de archivos:** Uso de un identificador único en el nombre del archivo de salida para prevenir la sobreescritura accidental.

---

## Requisitos previos

Para utilizar la aplicación es necesario contar con:

1. **FFmpeg y FFprobe:** Deben estar instalados en el sistema y agregados a las variables de entorno (PATH). La aplicación verifica su disponibilidad al arrancar.
2. **Clave de API de Google Gemini:** Clave para procesar las peticiones en lenguaje natural, configurable desde los ajustes de la interfaz.

---

## Guía para desarrolladores

Pasos para ejecutar o construir el proyecto localmente:

### 1. Instalación de dependencias

```bash
npm install
```

### 2. Ejecutar en modo desarrollo

Inicia la aplicación con recarga en caliente:

```bash
npm run tauri dev
```

### 3. Construir la aplicación

Genera el instalador ejecutable optimizado para el sistema operativo actual:

```bash
npm run tauri build
```

---

## Presets por categoría

La aplicación incluye presets organizados para facilitar las tareas comunes:

| Categoría          | Acciones comunes                                                                                                    |
| :----------------- | :------------------------------------------------------------------------------------------------------------------ |
| **Video**          | Conversión a MP4, WebM, AVI, MKV, MOV y compresión de tamaño.                                                       |
| **Audio**          | Extracción a MP3, WAV, AAC, OGG, FLAC; normalización, cambio de volumen y reducción de ruido.                       |
| **Edición**        | Cambio de resolución (1080p, 720p, 4K), rotación, velocidad (cámara rápida/lenta), recorte de segmentos y fundidos. |
| **Redes Sociales** | Conversión a formato cuadrado (1:1), vertical (9:16) y perfiles de optimización para redes específicas.             |
| **Imágenes**       | Conversión de video a GIF animado, extracción de fotogramas y capturas de miniatura.                                |
| **Herramientas**   | Estabilización de video, cambio de códecs (H.265/HEVC, VP9), limpieza de metadatos y extracción de subtítulos.      |
