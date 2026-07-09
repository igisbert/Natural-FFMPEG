import { useEffect, useState } from "preact/hooks";
import styles from "./ModelSelector.module.css";
import fallbackModels from "../../listModels.json";

export default function ModelSelector({ model, setModel }) {
  const [models, setModels] = useState(fallbackModels);
  const rawModelList = `https://raw.githubusercontent.com/igisbert/Natural-FFMPEG/refs/heads/master/listModels.json?t=${Date.now()}`;
  //const rawModelList = "/listModels.json"; // Para desarrollo local

  useEffect(() => {
    fetch(rawModelList)
      .then((res) => {
        if (!res.ok) throw new Error("Error cargando modelos desde la nube");
        return res.json();
      })
      .then((data) => {
        if (data && typeof data === "object") {
          setModels(data);
        }
      })
      .catch((err) => {
        console.warn("Usando modelos locales de respaldo:", err);
      });
  }, []);

  const handleModelChange = (event) => {
    setModel(event.target.value);
  };

  return (
    <div className={styles.tabs}>
      {Object.entries(models)
        .filter(([key]) => key !== "embedding")
        .flatMap(([key, value]) => [
          <input
            key={`input-${key}`}
            checked={model === value.id}
            value={value.id}
            name="model"
            id={key}
            type="radio"
            className={styles.input}
            onChange={handleModelChange}
          />,
          <label key={`label-${key}`} htmlFor={key} className={styles.label}>
            {value.name}
          </label>,
        ])}
    </div>
  );
}
