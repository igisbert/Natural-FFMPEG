import { removeSecret } from "../utils/store";
import style from "./DeleteApiKeyButton.module.css";
import { Eraser } from "lucide-preact";

export default function DeleteApiKeyButton({ apiKeyName, setApiKey }) {
  async function handleDelete() {
    const confirmed = await window.confirm(
      "¿Estás seguro de que deseas eliminar la API key?"
    );
    if (confirmed) {
      try {
        await removeSecret(apiKeyName);
        setApiKey(null); // Update state in parent component
      } catch (error) {
        console.error("Error deleting API key:", error);
      }
    }
  }
  return (
    <button className={style.button} onClick={handleDelete}>
      Borrar API Key <Eraser className={style.icon} />
    </button>
  );
  //return <Button onClick={handleDelete}>Delete API Key</Button>;
}
