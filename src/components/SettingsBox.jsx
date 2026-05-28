import style from "./SettingsBox.module.css";
import DeleteApiKeyButton from "./DeleteApiKeyButton";

export default function SettingsBox({ apiKey, apiKeyName, setApiKey }) {
  return (
    <div className={style.settingsBox}>
      {apiKey && (
        <DeleteApiKeyButton setApiKey={setApiKey} apiKeyName={apiKeyName}>
          Borrar API key
        </DeleteApiKeyButton>
      )}
    </div>
  );
}
