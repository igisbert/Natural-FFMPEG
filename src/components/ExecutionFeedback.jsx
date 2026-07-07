import style from "./ExecutionFeedback.module.css";
import { Check, XCircle } from "lucide-preact";

export default function ExecutionFeedback({ execution }) {
  return (
    <div className={style.feedbackContainer}>
      {execution.status === "running" && (
        <div className={style.progressBarContainer}>
          <div
            className={style.progressBar}
            style={{ width: `${execution.progress}%` }}
          ></div>
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
