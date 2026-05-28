import { AlertCircle } from "lucide-preact";
import style from "./ErrorMessage.module.css";

export default function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div className={style.errorContainer}>
      <div className={style.mainMessage}>
        <AlertCircle size={20} className={style.icon} />
        <span>{message}</span>
      </div>
    </div>
  );
}
