import { Upload } from "lucide-preact";
import style from "./UploadButton.module.css";

export default function UploadButton({ handleFileSelect }) {
  return (
    <div className={style.uploadButtonContainer}>
      <button
        type="button"
        className={style.uploadButton}
        onClick={handleFileSelect}
      >
        Añadir archivos <Upload class={style.icon} />
      </button>
      <label className={style.text}>o arrástralos y suéltalos</label>
    </div>
  );
}
