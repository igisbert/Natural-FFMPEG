import style from "./ExecutionFeedback.module.css";
import { Check, XCircle } from "lucide-preact";

function formatRemaining(seconds) {
  if (!seconds || seconds <= 0) return null;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

export default function ExecutionFeedback({ execution, onShowDetails }) {
  if (execution.status === "error") {
    return (
      <div className={style.feedbackContainer}>
        <div className={style.errorContainer}>
          <span>{execution.error}</span>
          <button className={style.detailsButton} onClick={onShowDetails}>
            Ver detalles
          </button>
        </div>
      </div>
    );
  }

  if (execution.status === "idle" || execution.status === "starting") {
    return null;
  }

  const remaining = formatRemaining(execution.remaining);

  return (
    <div className={style.feedbackContainer}>
      <div className={style.panel}>
        {execution.status === "running" && (
          <>
            <div className={style.spinner}></div>
            <div className={`${style.stats} ${(execution.elapsed || execution.speed !== null) ? "" : style.hidden}`}>
              {execution.elapsed && <span>Tiempo: {execution.elapsed}</span>}
              {execution.speed !== null && <span>Velocidad: {execution.speed}x</span>}
              {remaining && <span>Restante: ~{remaining}</span>}
            </div>
          </>
        )}
        {execution.status === "success" && <Check className={style.icon} />}
        {execution.status === "cancelled" && <XCircle className={`${style.icon} ${style.cancelled}`} />}
      </div>
    </div>
  );
}
