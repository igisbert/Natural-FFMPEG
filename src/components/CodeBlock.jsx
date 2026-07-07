import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import style from "./CodeBlock.module.css";
import { Play, Copy, XCircle } from "lucide-preact";
import { useState } from "preact/hooks";

export default function CodeBlock({ children, onRunCommand, onCancelCommand, isRunning }) {
  const [isAnimating, setIsAnimating] = useState({ copy: false, run: false, cancel: false });

  const copyToClipboard = async () => {
    await writeText(children);
    setIsAnimating((prev) => ({ ...prev, copy: true }));
  };

  const handleRunCommand = () => {
    setIsAnimating((prev) => ({ ...prev, run: true }));
    onRunCommand();
  };

  const handleCancelCommand = () => {
    setIsAnimating((prev) => ({ ...prev, cancel: true }));
    onCancelCommand();
  };

  return (
    <div className={style.codeBlockContainer}>
      <div className={style.codeBlock}>
        <h3 className={style.codeBlockTitle}>Comando generado:</h3>
        {children}
      </div>
      <footer className={style.buttonsContainer}>
        <button
          className={`${style.codeBlockButton} ${style.cancelButton} ${
            !isRunning ? style.hidden : ""
          } ${isAnimating.cancel ? style.animate : ""}`}
          onClick={handleCancelCommand}
          onAnimationEnd={() =>
            setIsAnimating((prev) => ({ ...prev, cancel: false }))
          }
          disabled={!isRunning}
        >
          <XCircle size={24}></XCircle> Cancelar
        </button>
        <div className={style.rightButtons}>
          <button
            className={`${style.codeBlockButton} ${
              isAnimating.copy ? style.animate : ""
            }`}
            onClick={copyToClipboard}
            onAnimationEnd={() =>
              setIsAnimating((prev) => ({ ...prev, copy: false }))
            }
            disabled={isRunning}
          >
            <Copy size={24}></Copy> Copiar
          </button>
          <button
            className={`${style.codeBlockButton} ${
              isAnimating.run ? style.animate : ""
            }`}
            onClick={handleRunCommand}
            onAnimationEnd={() =>
              setIsAnimating((prev) => ({ ...prev, run: false }))
            }
            disabled={isRunning}
          >
            <Play size={24}></Play> Ejecutar
          </button>
        </div>
      </footer>
    </div>
  );
}
