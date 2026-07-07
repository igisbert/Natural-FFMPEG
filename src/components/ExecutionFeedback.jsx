import style from "./ExecutionFeedback.module.css";
import { Check, XCircle } from "lucide-preact";

export default function ExecutionFeedback({ execution }) {
  return (
    <div className={style.feedbackContainer}>
      {execution.status === "running" && (
        <div className={style.runningContainer}>
          <div className={style.loader}></div>
          <span className={style.infoText}>
            {execution.elapsed && <span>{execution.elapsed}</span>}
            {execution.speed !== null && <span>{execution.speed}x</span>}
          </span>
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
