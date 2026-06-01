import { open } from "@tauri-apps/plugin-dialog";
import { useRef, useState, useEffect } from "preact/hooks";
import { allowDragAndDrop } from "../utils/allowDragAndDrop";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import CodeBlock from "./CodeBlock";
import ExecutionFeedback from "./ExecutionFeedback";
import { getSecret, setSecret, SECRET_KEYS } from "../utils/store";

import style from "./Application.module.css";

import Input from "./Input";
import Button from "./Button";
import { Code, Upload } from "lucide-preact";
import { Sparkles } from "lucide-preact";
import geminiIconUrl from "../assets/gemini.svg?url";
import ModelSelector from "./ModelSelector";
import modelsList from "../utils/modelsList";
import DragOverlay from "./DragOverlay";
import FileList from "./FileList";
import ErrorMessage from "./ErrorMessage";
import { translateGeminiError } from "../utils/geminiErrorHandler";
import UploadButton from "./UploadButton";

export default function Application({
  apiKey,
  showPresets,
  setShowPresets,
  commandInput,
  setCommandInput,
}) {
  const form = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [ffmpegCommand, setFfmpegCommand] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState({ message: "", details: "" });
  const [model, setModelState] = useState(modelsList.flash.id);
  const [execution, setExecution] = useState({
    status: "idle", // idle, running, success, error
    progress: 0,
    error: null,
  });

  const videoExtensions = [
    "mp4",
    "avi",
    "mkv",
    "mov",
    "wmv",
    "flv",
    "webm",
    "mpeg",
    "mpg",
    "m4v",
    "3gp",
    "ogv",
    "ts",
    "mts",
    "m2ts",
  ];
  const imageExtensions = ["jpg", "jpeg", "png", "webp", "bmp", "gif"];

  const resetStates = () => {
    setError({ message: "", details: "" });
    setExecution({ status: "idle", progress: 0, error: null });
    setFfmpegCommand("");
  };

  useEffect(() => {
    const loadModel = async () => {
      const savedModel = await getSecret(SECRET_KEYS.GEMINI_MODEL);
      if (savedModel) {
        setModelState(savedModel);
      }
    };
    loadModel();
  }, []);

  const handleSetModel = async (newModel) => {
    setModelState(newModel);
    await setSecret(SECRET_KEYS.GEMINI_MODEL, newModel);
  };

  useEffect(() => {
    if (commandInput) {
      resetStates();
    }
  }, [commandInput]);

  useEffect(() => {
    const unlistenProgress = listen("ffmpeg-progress", (event) => {
      setExecution({
        status: "running",
        progress: event.payload,
        error: null,
      });
    });

    const unlistenSuccess = listen("ffmpeg-success", () => {
      setExecution({ status: "success", progress: 100, error: null });
      setTimeout(() => {
        setExecution({ status: "idle", progress: 0, error: null });
      }, 2000); // Reset after 2 seconds
    });

    const unlistenError = listen("ffmpeg-error", (event) => {
      setExecution({ status: "error", progress: 0, error: event.payload });
    });

    return () => {
      unlistenProgress.then((f) => f());
      unlistenSuccess.then((f) => f());
      unlistenError.then((f) => f());
    };
  }, []);

  const processPaths = (paths) => {
    resetStates();
    const newFiles = paths
      .map((path) => {
        const name = path.split(/[\\/]/).pop();
        const extension = name.split(".").pop().toLowerCase();
        let type = "other";
        if (videoExtensions.includes(extension)) type = "video";
        else if (imageExtensions.includes(extension)) type = "image";

        return { path, name, type };
      })
      .filter((file) => file.type !== "other");

    setSelectedFiles((prev) => {
      const existingPaths = prev.map((f) => f.path);
      const uniqueNewFiles = newFiles.filter(
        (f) => !existingPaths.includes(f.path),
      );
      return [...prev, ...uniqueNewFiles];
    });
  };

  useEffect(() => {
    let unlisten;

    // Inicializar drag and drop
    allowDragAndDrop({
      onDragEnter: () => setIsDragging(true),
      onDragLeave: () => setIsDragging(false),
      onDrop: (paths) => {
        processPaths(paths);
      },
    }).then((unlistenFn) => {
      unlisten = unlistenFn;
    });

    // Cleanup
    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  const handleFileSelect = async () => {
    try {
      const selected = await open({
        multiple: true,
        filters: [
          {
            name: "Multimedia",
            extensions: [...videoExtensions, ...imageExtensions],
          },
        ],
      });

      if (selected && selected.length > 0) {
        resetStates();
        processPaths(selected);
      }
    } catch (error) {
      console.error("Error al seleccionar archivo:", error);
    }
  };

  const removeFile = (index) => {
    resetStates();
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const userPrompt = commandInput;
    if (selectedFiles.length === 0 || !userPrompt) {
      return;
    }

    setIsLoading(true);
    resetStates();

    try {
      let outputFolder = await getSecret(SECRET_KEYS.OUTPUT_FOLDER);

      const command = await invoke("generate_command", {
        inputPaths: selectedFiles.map((f) => f.path),
        outputFolder: outputFolder,
        prompt: userPrompt,
        apiKey: apiKey,
        model: model,
      });

      setFfmpegCommand(command);
    } catch (e) {
      const friendlyMessage = translateGeminiError(e);
      setError({ message: friendlyMessage, details: e });
    } finally {
      setIsLoading(false);
    }
  };

  const runCommand = async (command) => {
    setExecution({ status: "running", progress: 0, error: null });
    await invoke("execute_ffmpeg_command", { command });
  };

  return (
    <>
      <div className={style.container}>
        <UploadButton onClick={handleFileSelect} />
        {/*         <div className={style.uploadButtonContainer}>
          <button
            type="button"
            className={style.uploadButton}
            onClick={handleFileSelect}
          >
            Añadir archivos <Upload class={style.icon} />
          </button>
          <label className={style.text}>
            o arrástralos y suéltalos
          </label>
        </div> */}

        <FileList files={selectedFiles} onRemove={removeFile} />

        <form action="" ref={form} class={style.form} onSubmit={handleSubmit}>
          <Input
            setShowPresets={setShowPresets}
            commandInput={commandInput}
            setCommandInput={setCommandInput}
            name={"user-prompt"}
            placeholder="¿Qué quieres hacer?"
          />{" "}
          <ModelSelector model={model} setModel={handleSetModel} />
          <button
            type="submit"
            disabled={isLoading || selectedFiles.length === 0}
            className={`${style.submitButton} ${
              isLoading ? style.loading : ""
            }`}
          >
            <span className={style.buttonText}>
              {isLoading ? "Generando..." : "Obtener comando"}
            </span>
            <img
              src={geminiIconUrl}
              className={style.geminiIcon}
              alt="Gemini Icon"
            />
          </button>
        </form>

        <ErrorMessage message={error.message} />

        {ffmpegCommand && (
          <div className={style.resultContainer}>
            <h3>Comando FFmpeg generado:</h3>
            <CodeBlock
              onRunCommand={() => runCommand(ffmpegCommand)}
              isRunning={execution.status === "running"}
            >
              {ffmpegCommand}
            </CodeBlock>
            <ExecutionFeedback execution={execution} />
          </div>
        )}
      </div>
      <DragOverlay isDragging={isDragging} />
    </>
  );
}
