import style from "./ExecutionFeedback.module.css";
import { Check, XCircle } from "lucide-preact";

export default function ExecutionFeedback({ execution }) {
  if (execution.status === "error") {
    return (
      <div className={style.feedbackContainer}>
        <div className={style.errorContainer}>{execution.error}</div>
      </div>
    );
  }

  if (execution.status === "idle") {
    return null;
  }

  return (
    <div className={style.feedbackContainer}>
      <div className={style.panel}>
        {execution.status === "running" && (
          <>
            <div className={style.spinner}></div>
            <div className={`${style.stats} ${!execution.elapsed && execution.speed === null ? style.hidden : ""}`}>
              {execution.elapsed && <span>Tiempo: {execution.elapsed}</span>}
              {execution.speed !== null && <span>Velocidad: {execution.speed}x</span>}
            </div>
          </>
        )}
        {execution.status === "success" && <Check className={style.icon} />}
        {execution.status === "cancelled" && <XCircle className={`${style.icon} ${style.cancelled}`} />}
      </div>
    </div>
  );
}
