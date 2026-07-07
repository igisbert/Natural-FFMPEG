import { useRef, useEffect } from "preact/hooks";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import style from "./ErrorDialog.module.css";
import { Copy, X } from "lucide-preact";

export default function ErrorDialog({ isOpen, onClose, message, details }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleCopy = async () => {
    await writeText(details || "");
  };

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={style.dialog}
      onClose={onClose}
      onClick={handleBackdropClick}
    >
      <div className={style.content}>
        <header className={style.header}>
          <h2 className={style.title}>{message}</h2>
          <button className={style.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        {details && (
          <div className={style.detailsContainer}>
            <pre className={style.details}>{details}</pre>
          </div>
        )}

        <footer className={style.footer}>
          <button className={style.copyButton} onClick={handleCopy}>
            <Copy size={16} /> Copiar error
          </button>
          <button className={style.closeFooterButton} onClick={onClose}>
            Cerrar
          </button>
        </footer>
      </div>
    </dialog>
  );
}
