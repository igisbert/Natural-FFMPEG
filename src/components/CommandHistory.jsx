import { useState, useEffect } from "preact/hooks";
import { Clock, Bookmark, ChevronRight, Trash2, Play, Copy, Check, Sparkles } from "lucide-preact";
import { getSecret, setSecret, SECRET_KEYS } from "../utils/store";
import FileSlotSelector from "./FileSlotSelector";
import style from "./CommandHistory.module.css";

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return "Ahora mismo";
  if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)}h`;
  
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export default function CommandHistory({ isOpen, onClose, onReimagine, onExecute }) {
  const [activeTab, setActiveTab] = useState("recent");
  const [recent, setRecent] = useState([]);
  const [saved, setSaved] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [executingItem, setExecutingItem] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    const recentData = await getSecret(SECRET_KEYS.COMMAND_HISTORY_RECENT);
    const savedData = await getSecret(SECRET_KEYS.COMMAND_HISTORY_SAVED);
    setRecent(recentData || []);
    setSaved(savedData || []);
  };

  const saveToRecent = async (item) => {
    const updated = [item, ...recent.filter((r) => r.id !== item.id)].slice(0, 20);
    setRecent(updated);
    await setSecret(SECRET_KEYS.COMMAND_HISTORY_RECENT, updated);
  };

  const saveToSaved = async (item) => {
    const exists = saved.some((s) => s.id === item.id);
    if (exists) return;
    const updated = [item, ...saved];
    setSaved(updated);
    await setSecret(SECRET_KEYS.COMMAND_HISTORY_SAVED, updated);
  };

  const removeFromSaved = async (id) => {
    const updated = saved.filter((s) => s.id !== id);
    setSaved(updated);
    await setSecret(SECRET_KEYS.COMMAND_HISTORY_SAVED, updated);
  };

  const handleExecute = (item) => {
    setExecutingItem(item);
  };

  const handleConfirmExecute = (selectedFiles) => {
    if (!executingItem) return;

    let command = executingItem.command;
    executingItem.inputFiles.forEach((originalPath, i) => {
      if (selectedFiles[i]) {
        command = command.replace(originalPath, selectedFiles[i]);
      }
    });

    onExecute(command);
    setExecutingItem(null);
    onClose();
  };

  const handleCancelExecute = () => {
    setExecutingItem(null);
  };

  const handleCopy = async (item) => {
    await navigator.clipboard.writeText(item.command);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleReimagine = (item) => {
    onReimagine(item);
    onClose();
  };

  const toggleSave = async (item) => {
    const isSaved = saved.some((s) => s.id === item.id);
    if (isSaved) {
      await removeFromSaved(item.id);
    } else {
      await saveToSaved(item);
    }
  };

  const handleDelete = async (item) => {
    const updatedRecent = recent.filter((r) => r.id !== item.id);
    setRecent(updatedRecent);
    await setSecret(SECRET_KEYS.COMMAND_HISTORY_RECENT, updatedRecent);
    
    if (saved.some((s) => s.id === item.id)) {
      await removeFromSaved(item.id);
    }
    
    setExpandedId(null);
  };

  const items = activeTab === "recent" ? recent : saved;

  if (!isOpen) return null;

  return (
    <div className={style.overlay} onClick={onClose}>
      <aside className={style.sidebar} onClick={(e) => e.stopPropagation()}>
        <header className={style.header}>
          <h2 className={style.title}>
            {executingItem ? "Seleccionar ficheros" : "Historial"}
          </h2>
          <button className={style.closeButton} onClick={executingItem ? handleCancelExecute : onClose}>
            ✕
          </button>
        </header>

        {executingItem ? (
          <FileSlotSelector
            inputFiles={executingItem.inputFiles}
            fileTypes={executingItem.fileTypes}
            onExecute={handleConfirmExecute}
            onCancel={handleCancelExecute}
          />
        ) : (
          <>
            <div className={style.tabs}>
              <button
                className={`${style.tab} ${activeTab === "recent" ? style.activeTab : ""}`}
                onClick={() => setActiveTab("recent")}
              >
                <Clock size={16} /> Recientes
              </button>
              <button
                className={`${style.tab} ${activeTab === "saved" ? style.activeTab : ""}`}
                onClick={() => setActiveTab("saved")}
              >
                <Bookmark size={16} /> Guardados
              </button>
            </div>

            <div className={style.list}>
              {items.length === 0 && (
                <p className={style.empty}>
                  {activeTab === "recent" ? "No hay comandos recientes" : "No hay guardados"}
                </p>
              )}

              {items.map((item) => (
                <div key={item.id} className={`${style.item} ${expandedId === item.id ? style.itemExpanded : ""}`}>
                  <button
                    className={style.itemHeader}
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    <div className={style.itemInfo}>
                      <span className={style.itemPrompt}>{item.prompt}</span>
                      <span className={style.itemDate}>{formatDate(item.timestamp)}</span>
                    </div>
                    <ChevronRight
                      size={16}
                      className={`${style.chevron} ${expandedId === item.id ? style.chevronOpen : ""}`}
                    />
                  </button>

                  {expandedId === item.id && (
                    <div className={style.itemActions}>
                      <button
                        className={style.actionButton}
                        onClick={() => handleExecute(item)}
                      >
                        <Play size={14} /> Ejecutar
                      </button>
                      <button
                        className={style.actionButton}
                        onClick={() => handleReimagine(item)}
                      >
                        <Sparkles size={14} /> Reimaginar
                      </button>
                      <button
                        className={style.actionButton}
                        onClick={() => handleCopy(item)}
                      >
                        {copiedId === item.id ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
                      </button>
                      <button
                        className={`${style.actionButton} ${style.saveButton} ${saved.some((s) => s.id === item.id) ? style.saved : ""}`}
                        onClick={() => toggleSave(item)}
                      >
                        <Bookmark size={14} />
                        {saved.some((s) => s.id === item.id) ? "Guardado" : "Guardar"}
                      </button>
                      <button
                        className={`${style.actionButton} ${style.deleteButton}`}
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 size={14} /> Borrar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
