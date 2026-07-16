import styles from "./Input.module.css";
import { Gem } from "lucide-preact";

export default function Input({
  label,
  type = "text",
  name,
  placeholder,
  showPresetsButton = false,
  onPresetsClick,
  value,
  onInput,
  disabled,
  ...props
}) {
  return (
    <div className={styles.inputContainer}>
      <input
        className={styles.input}
        type={type}
        name={name}
        placeholder={placeholder}
        autocomplete="off"
        value={value}
        onInput={onInput}
        disabled={disabled}
        {...props}
      />
      {showPresetsButton && (
        <button
          className={styles.button}
          onClick={onPresetsClick}
          type="button"
          disabled={disabled}
        >
          <Gem size={32} stroke-width={2} />
        </button>
      )}
    </div>
  );
}

