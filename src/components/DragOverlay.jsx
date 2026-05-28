import { Upload } from "lucide-preact";
import style from "./DragOverlay.module.css";

export default function DragOverlay({ isDragging }) {
  if (!isDragging) return null;

  return (
    <div className={style.overlay}>
      <div className={style.content}>
        <Upload size={64} className={style.icon} />
        <p className={style.text}>Suelta tu vídeo aquí</p>
      </div>
    </div>
  );
}
