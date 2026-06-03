import styles from "./Input.module.css";
import { Gem } from "lucide-preact";

export default function Input({
  label,
  type = "text",
  name,
  placeholder,
  setShowPresets,
  commandInput,
  setCommandInput,
}) {
  const handleShowPresets = () => {
    setShowPresets((currentValue) => !currentValue);
  };

  const handleInputChange = (event) => {
    setCommandInput(event.target.value);
  };

  return (
    <div className={styles.inputContainer}>
      <input
        className={styles.input}
        type={type}
        name={name}
        placeholder={placeholder}
        autocomplete="off"
        value={commandInput}
        onInput={handleInputChange}
      />
      <button
        className={styles.button}
        onClick={handleShowPresets}
        type="button"
      >
        <Gem size={32} stroke-width={2} />
      </button>
    </div>
  );
}
