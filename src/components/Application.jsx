import { open } from "@tauri-apps/plugin-dialog";
import { useRef, useState, useEffect } from "preact/hooks";
import { allowDragAndDrop } from "../utils/allowDragAndDrop";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import CodeBlock from "./CodeBlock";
import ExecutionFeedback from "./ExecutionFeedback";
import ErrorDialog from "./ErrorDialog";
import { getSecret, setSecret, SECRET_KEYS } from "../utils/store";

import style from "./Application.module.css";

import Input from "./Input";
import Button from "./Button";
import { Code, Upload } from "lucide-preact";
import GeminiButton from "./GeminiButton";
import ModelSelector from "./ModelSelector";
import modelsList from "../utils/modelsList";
import DragOverlay from "./DragOverlay";
import FileList from "./FileList";
import ErrorMessage from "./ErrorMessage";
import { translateGeminiError } from "../utils/geminiErrorHandler";
import UploadButton from "./UploadButton";

function parseElapsed(str) {
  if (!str) return 0;
  const parts = str.split(':');
  if (parts.length === 3) {
    return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
  }
  return 0;
}

function formatRemaining(seconds) {
  if (!seconds || seconds <= 0) return null;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

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
    status: "idle",
    speed: null,
    elapsed: null,
    remaining: null,
    error: null,
    errorDetails: null,
  });
  const [dialogOpen, setDialogOpen] = useState(false);

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
    setExecution({ status: "idle", speed: null, elapsed: null, remaining: null, error: null, errorDetails: null });
    setDialogOpen(false);
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
    const MINIMUM_LOADING_TIME = 750;
    let commandStartTime = 0;

    const unlistenStarted = listen("ffmpeg-started", () => {
      commandStartTime = Date.now();
      setTimeout(() => {
        setExecution((prev) => {
          if (prev.status === "starting") {
            return { ...prev, status: "running" };
          }
          return prev;
        });
      }, MINIMUM_LOADING_TIME);
    });

    const unlistenSpeed = listen("ffmpeg-speed", (event) => {
      const [speed, elapsed, duration] = event.payload;
      const remaining = speed > 0 ? (duration / speed) - parseElapsed(elapsed) : null;
      setExecution({
        status: "running",
        speed,
        elapsed,
        remaining,
        error: null,
      });
    });

    const unlistenSuccess = listen("ffmpeg-success", () => {
      setExecution({ status: "success", speed: null, error: null });
      setTimeout(() => {
        setExecution({ status: "idle", speed: null, error: null });
      }, 2000); // Reset after 2 seconds
    });

    const unlistenError = listen("ffmpeg-error", (event) => {
      const { message, details } = event.payload;
      setExecution((prev) => {
        if (prev.status === "starting") {
          return { status: "error", speed: null, elapsed: null, remaining: null, error: message, errorDetails: details };
        }
        return { ...prev, status: "error", error: message, errorDetails: details };
      });
    });

    const unlistenCancelled = listen("ffmpeg-cancelled", () => {
      setExecution({ status: "cancelled", speed: null, error: null });
      setTimeout(() => {
        setExecution({ status: "idle", speed: null, error: null });
      }, 2000);
    });

    return () => {
      unlistenStarted.then((f) => f());
      unlistenSpeed.then((f) => f());
      unlistenSuccess.then((f) => f());
      unlistenError.then((f) => f());
      unlistenCancelled.then((f) => f());
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
    setExecution({ status: "starting", speed: null, elapsed: null, remaining: null, error: null, errorDetails: null });
    await invoke("execute_ffmpeg_command", { command });
  };

  const cancelCommand = async () => {
    try {
      await invoke("cancel_ffmpeg_command");
    } catch (e) {
      console.error("Error cancelling command:", e);
    }
  };

  return (
    <>
      <div className={style.container}>
        <UploadButton handleFileSelect={handleFileSelect} />

        <FileList files={selectedFiles} onRemove={removeFile} />

        <form action="" ref={form} class={style.form} onSubmit={handleSubmit}>
          <Input
            showPresetsButton
            onPresetsClick={() =>
              setShowPresets((currentValue) => !currentValue)
            }
            value={commandInput}
            onInput={(event) => setCommandInput(event.target.value)}
            name={"user-prompt"}
            placeholder="¡Describe con precisión lo que quieres hacer!"
            disabled={execution.status === "starting" || execution.status === "running"}
          />{" "}
          <ModelSelector model={model} setModel={handleSetModel} />
          <GeminiButton
            isLoading={isLoading}
            disabled={selectedFiles.length === 0 || execution.status === "starting" || execution.status === "running"}
          />
        </form>

        <ErrorMessage message={error.message} />

        {ffmpegCommand && (
          <>
            <CodeBlock
              onRunCommand={() => runCommand(ffmpegCommand)}
              onCancelCommand={cancelCommand}
              isRunning={execution.status === "running"}
            >
              {ffmpegCommand}
            </CodeBlock>
            <ExecutionFeedback
              execution={execution}
              onShowDetails={() => setDialogOpen(true)}
            />
          </>
        )}
      </div>
      <DragOverlay isDragging={isDragging} />
      <ErrorDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        message={execution.error}
        details={execution.errorDetails}
      />
    </>
  );
}
