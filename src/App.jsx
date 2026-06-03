import { useState, useEffect } from "preact/hooks";
import { invoke } from "@tauri-apps/api/core";
import { getSecret, SECRET_KEYS } from "./utils/store";

import Loader from "./components/Loader";
import InstallFFmpeg from "./components/InstallFFmpeg";
import AddAPIKey from "./components/AddAPIKey";
import ConfigFooter from "./components/ConfigFooter";
import Application from "./components/Application";
import Presets from "./components/Presets";
import { getCurrentWindow } from "@tauri-apps/api/window";

import "./reset.css";
import "./App.css";
import "@fontsource/poppins";

function App() {
  const apiKeyName = SECRET_KEYS.GEMINI_API_KEY;
  const [ffmpegInstalled, setFfmpegInstalled] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const [showPresets, setShowPresets] = useState(false);
  const [commandInput, setCommandInput] = useState("");

  useEffect(() => {
    const appWindow = getCurrentWindow();
    appWindow.show();
  }, []);

  useEffect(() => {
    invoke("check_ffmpeg")
      .then(setFfmpegInstalled)
      .catch((error) => {
        console.error("Error checking FFmpeg:", error);
        setFfmpegInstalled(false);
      });
  }, []);

  useEffect(() => {
    async function loadApiKey() {
      const storedKey = await getSecret(apiKeyName);
      if (storedKey) {
        setApiKey(storedKey);
      }
    }
    loadApiKey();
  }, []);

  return (
    <main class="container">
      {ffmpegInstalled === null && <Loader />}
      {!ffmpegInstalled && <InstallFFmpeg />}
      {apiKey ? (
        <Application
          apiKey={apiKey}
          showPresets={showPresets}
          setShowPresets={setShowPresets}
          commandInput={commandInput}
          setCommandInput={setCommandInput}
        />
      ) : (
        <AddAPIKey apiKeyName={apiKeyName} setApiKey={setApiKey} />
      )}

      {apiKey && <ConfigFooter apiKey={apiKey} setApiKey={setApiKey} />}
      <Presets
        showPresets={showPresets}
        setShowPresets={setShowPresets}
        onPresetSelect={setCommandInput}
      />
    </main>
  );
}

export default App;
