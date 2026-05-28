import styles from "./InstallFFmpeg.module.css";
import { open } from "@tauri-apps/plugin-shell";
import Button from "./Button";

export default function InstallFFmpeg() {
  const handleOpenUrl = async () => {
    try {
      await open("https://www.ffmpeg.org/download.html");
    } catch (error) {
      console.error("Error al abrir URL:", error);
    }
  };
  return (
    <div className={styles.container}>
      <h2 className={styles.text}>
        FFmpeg no está instalado en este dispositivo. Instálalo para poder usar
        Natural FFmpeg
      </h2>
      <Button onClick={handleOpenUrl}>Descargar FFmpeg</Button>
    </div>
  );
}
