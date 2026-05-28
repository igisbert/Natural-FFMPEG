import { open } from "@tauri-apps/plugin-shell";
import { useRef } from "preact/hooks";
import { setSecret } from "../utils/store";
import styles from "./AddAPIKey.module.css";
import Button from "./Button";
import Input from "./Input";

export default function AddAPIKey({ apiKeyName, setApiKey }) {
  const formRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(formRef.current);
    const apiKey = formData.get("apiKey");
    await setSecret(apiKeyName, apiKey);
    setApiKey(apiKey); // Update state in parent component
  }

  const handleOpenUrl = async () => {
    try {
      await open("https://aistudio.google.com/api-keys");
    } catch (error) {
      console.error("Error al abrir URL:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Introduce tu API key de Gemini</h2>
      <form
        className={styles.form}
        action=""
        ref={formRef}
        onSubmit={handleSubmit}
      >
        <Input
          type="text"
          name="apiKey"
          placeholder="Introduce tu API Key"
          label="API Key"
        />
        {/* <button type="submit">Guardar</button> */}
        <Button type="submit">Guardar</Button>
      </form>

      <h2>¿No tienes una?</h2>
      <Button onClick={handleOpenUrl}>Obtener API Key</Button>
      <span>
        Se requiere una cuenta de Google con verificación de mayoría de edad
      </span>
    </div>
  );
}
