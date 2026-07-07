import style from "./ExecutionFeedback.module.css";
import { Check, XCircle } from "lucide-preact";

export default function ExecutionFeedback({ execution }) {
  return (
    <div className={style.feedbackContainer}>
      {execution.status === "running" && (
        <div className={style.runningContainer}>
          <div className={style.spinner}></div>
          <div className={`${style.stats} ${!execution.elapsed && execution.speed === null ? style.hidden : ""}`}>
            {execution.elapsed && <span>Tiempo: {execution.elapsed}</span>}
            {execution.speed !== null && <span>Velocidad: {execution.speed}x</span>}
          </div>
        </div>
      )}
      {execution.status === "success" && <Check className={style.checkIcon} />}
      {execution.status === "cancelled" && (
        <XCircle className={style.cancelledIcon} />
      )}
      {execution.status === "error" && (
        <div className={style.errorContainer}>{execution.error}</div>
      )}
    </div>
  );
}
