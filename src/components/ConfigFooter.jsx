import { useState, useEffect } from "preact/hooks";
import { open } from "@tauri-apps/plugin-dialog";
import { desktopDir } from "@tauri-apps/api/path";
import {
  Folder,
  Trash2,
  Bell,
  BellOff,
  BookOpen,
  Ban,
  CircleCheck,
  HelpCircle,
} from "lucide-preact";
import {
  getSecret,
  setSecret,
  removeSecret,
  SECRET_KEYS,
} from "../utils/store";
import style from "./ConfigFooter.module.css";

export default function ConfigFooter({ apiKey, setApiKey }) {
  const [outputFolder, setOutputFolder] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [docsEnabled, setDocsEnabled] = useState(true);

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

  useEffect(() => {
    async function initNotifications() {
      const saved = await getSecret(SECRET_KEYS.NOTIFICATIONS_ENABLED);
      setNotifications(saved !== false);
    }
    initNotifications();
  }, []);

  useEffect(() => {
    async function initDocs() {
      const saved = await getSecret(SECRET_KEYS.FFMPEG_DOCS_ENABLED);
      setDocsEnabled(saved !== false);
    }
    initDocs();
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

  const toggleNotifications = async () => {
    const newValue = !notifications;
    setNotifications(newValue);
    await setSecret(SECRET_KEYS.NOTIFICATIONS_ENABLED, newValue);
  };

  const toggleDocs = async () => {
    const newValue = !docsEnabled;
    setDocsEnabled(newValue);
    await setSecret(SECRET_KEYS.FFMPEG_DOCS_ENABLED, newValue);
  };

  return (
    <footer className={style.footer}>
      <div className={style.cell}>
        <div
          className={style.configItem}
          onClick={handleSelectFolder}
          title={outputFolder}
        >
          <Folder size={16} />
          <span className={style.label}>Destino:</span>
          <span className={style.value}>{outputFolder}</span>
        </div>
      </div>

      <div className={style.cell}>
        <button className={style.toggleButton} onClick={toggleNotifications}>
          {notifications ? <Bell size={16} /> : <BellOff size={16} />}
          <span>Notificaciones</span>
        </button>
      </div>

      <div className={style.cell}>
        <button className={style.toggleButton} onClick={toggleDocs}>
          {docsEnabled ? <CircleCheck size={16} /> : <Ban size={16} />}
          <span>Inyectar documentación</span>
        </button>
        <span
          className={style.infoIcon}
          title="Incluye documentación oficial de FFmpeg al generar comandos, mejorando su precisión. Desactívalo si tus prompts son muy ambiguos, ya que puede afectar negativamente al resultado."
        >
          <HelpCircle size={14} />
        </span>
      </div>

      <div className={style.cell}>
        <button className={style.deleteButton} onClick={handleRemoveApiKey}>
          <Trash2 size={16} />
          <span>Borrar API Key</span>
        </button>
      </div>
    </footer>
  );
}
