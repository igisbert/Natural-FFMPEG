import styles from "./ModelSelector.module.css";
import modelsList from "../utils/modelsList";

export default function ModelSelector({ model, setModel }) {

  const handleModelChange = (event) => {
    setModel(event.target.value);
  };

  return (
    <div className={styles.tabs}>
      <input
        checked={model === modelsList.flash.id}
        value={modelsList.flash.id}
        name="model"
        id="flash"
        type="radio"
        className={styles.input}
        onChange={handleModelChange}
      />
      <label htmlFor="flash" className={styles.label}>
        {modelsList.flash.name}
      </label>

      <input
        checked={model === modelsList.pro.id}
        value={modelsList.pro.id}
        name="model"
        id="pro"
        type="radio"
        className={styles.input}
        onChange={handleModelChange}
      />
      <label htmlFor="pro" className={styles.label}>
        {modelsList.pro.name}
      </label>
    </div>
  );
}
