import { useState, useEffect } from "preact/hooks";
import { open } from "@tauri-apps/plugin-dialog";
import { desktopDir } from "@tauri-apps/api/path";
import { Folder, Key, Trash2 } from "lucide-preact";
import { getSecret, setSecret, removeSecret, SECRET_KEYS } from "../utils/store";
import style from "./ConfigFooter.module.css";

export default function ConfigFooter({ apiKey, setApiKey }) {
  const [outputFolder, setOutputFolder] = useState("");

  useEffect(() => {
    async function initFolder() {
      const savedFolder = await getSecret(SECRET_KEYS.OUTPUT_FOLDER);
      if (savedFolder) {
        setOutputFolder(savedFolder);
      } else {
        const defaultPath = await desktopDir();
        setOutputFolder(defaultPath);
        await setSecret(SECRET_KEYS.OUTPUT_FOLDER, defaultPath);
      }
    }
    initFolder();
  }, []);

  const handleSelectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Selecciona la carpeta de destino",
      });
      if (selected) {
        setOutputFolder(selected);
        await setSecret(SECRET_KEYS.OUTPUT_FOLDER, selected);
      }
    } catch (error) {
      console.error("Error al seleccionar carpeta:", error);
    }
  };

  const handleRemoveApiKey = async () => {
    await removeSecret(SECRET_KEYS.GEMINI_API_KEY);
    setApiKey(null);
  };

  return (
    <footer className={style.footer}>
      <div className={style.configItem} onClick={handleSelectFolder} title={outputFolder}>
        <Folder size={16} />
        <span className={style.label}>Destino:</span>
        <span className={style.value}>{outputFolder}</span>
      </div>

      <div className={style.divider} />

      <button className={style.deleteButton} onClick={handleRemoveApiKey}>
        <Trash2 size={16} />
        <span>Borrar API Key</span>
      </button>
    </footer>
  );
}
