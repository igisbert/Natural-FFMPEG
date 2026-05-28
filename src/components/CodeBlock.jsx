import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import style from "./CodeBlock.module.css";
import { Play } from "lucide-preact";
import { Copy } from "lucide-preact";
import { useState } from "preact/hooks";

export default function CodeBlock({ children, onRunCommand, isRunning }) {
  const [isAnimating, setIsAnimating] = useState({ copy: false, run: false });

  const copyToClipboard = async () => {
    await writeText(children);
    setIsAnimating((prev) => ({ ...prev, copy: true }));
  };

  const handleRunCommand = () => {
    setIsAnimating((prev) => ({ ...prev, run: true }));
    onRunCommand();
  };

  return (
    <>
      <div className={style.codeBlock}>
        {children}
      </div>
      <footer className={style.buttonsContainer}>
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
          <Copy size={18}></Copy>
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
          <Play size={18}></Play>
        </button>
      </footer>
    </>
  );
}
