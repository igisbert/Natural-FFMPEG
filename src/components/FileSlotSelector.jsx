import { useState } from "preact/hooks";
import { open } from "@tauri-apps/plugin-dialog";
import { FileVideo, FileImage, Check, Play } from "lucide-preact";
import style from "./FileSlotSelector.module.css";

const VIDEO_EXTENSIONS = ["mp4", "avi", "mkv", "mov", "wmv", "flv", "webm", "mpeg", "mpg", "m4v", "3gp", "ogv", "ts", "mts", "m2ts"];
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "bmp", "gif"];

function getFileExtension(filename) {
  return filename.split(".").pop().toLowerCase();
}

function isVideo(filename) {
  return VIDEO_EXTENSIONS.includes(getFileExtension(filename));
}

function isImage(filename) {
  return IMAGE_EXTENSIONS.includes(getFileExtension(filename));
}

function getFileFilterForType(type) {
  if (type === "video") return [{ name: "Vídeos", extensions: VIDEO_EXTENSIONS }];
  if (type === "image") return [{ name: "Imágenes", extensions: IMAGE_EXTENSIONS }];
  return [{ name: "Multimedia", extensions: [...VIDEO_EXTENSIONS, ...IMAGE_EXTENSIONS] }];
}

function getIconForFile(filename) {
  if (isVideo(filename)) return <FileVideo size={14} />;
  if (isImage(filename)) return <FileImage size={14} />;
  return <FileVideo size={14} />;
}

export default function FileSlotSelector({ inputFiles, fileTypes, onExecute, onCancel }) {
  const [selectedFiles, setSelectedFiles] = useState(
    () => new Array(inputFiles.length).fill(null)
  );

  const allFilled = selectedFiles.every((f) => f !== null);

  const handleSelectFile = async (index) => {
    const type = fileTypes[index] || "video";
    const filters = getFileFilterForType(type);

    const selected = await open({
      multiple: false,
      filters,
      title: `Selecciona fichero ${index + 1} de ${inputFiles.length}`,
    });

    if (selected) {
      const newFiles = [...selectedFiles];
      newFiles[index] = selected;
      setSelectedFiles(newFiles);
    }
  };

  const handleExecute = () => {
    if (!allFilled) return;
    onExecute(selectedFiles);
  };

  return (
    <div className={style.container}>
      <div className={style.slots}>
        {inputFiles.map((originalPath, index) => {
          const originalName = originalPath.split(/[\\/]/).pop();
          const selected = selectedFiles[index];
          const selectedName = selected ? selected.split(/[\\/]/).pop() : null;

          return (
            <div key={index} className={style.slot}>
              <div className={style.slotHeader}>
                <span className={style.slotLabel}>
                  {getIconForFile(originalName)}
                  Fichero {index + 1}
                </span>
                <span className={style.originalName}>{originalName}</span>
              </div>
              <button
                className={`${style.selectButton} ${selected ? style.selected : ""}`}
                onClick={() => handleSelectFile(index)}
              >
                {selected ? (
                  <>
                    <Check size={14} />
                    <span className={style.selectedName}>{selectedName}</span>
                  </>
                ) : (
                  "Seleccionar"
                )}
              </button>
            </div>
          );
        })}
      </div>
      <div className={style.actions}>
        <button className={style.cancelButton} onClick={onCancel}>
          Cancelar
        </button>
        <button
          className={`${style.executeButton} ${!allFilled ? style.disabled : ""}`}
          onClick={handleExecute}
          disabled={!allFilled}
        >
          <Play size={14} />
          Ejecutar
        </button>
      </div>
    </div>
  );
}
