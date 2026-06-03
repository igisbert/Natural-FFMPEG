import style from "./GeminiButton.module.css";
import geminiIconUrl from "../assets/gemini.svg?url";

export default function GeminiButton({ isLoading, disabled }) {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={`${style.submitButton} ${isLoading ? style.loading : ""}`}
    >
      <span className={style.buttonText}>
        {isLoading ? "Generando..." : "Obtener comando"}
      </span>
      <img
        src={geminiIconUrl}
        className={style.geminiIcon}
        alt="Gemini Icon"
      />
    </button>
  );
}
