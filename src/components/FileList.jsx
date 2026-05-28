import { X, Video, Image as ImageIcon, File } from "lucide-preact";
import style from "./FileList.module.css";

export default function FileList({ files, onRemove }) {
  if (files.length === 0) return null;

  const getIcon = (type) => {
    if (type === "video") return <Video size={18} />;
    if (type === "image") return <ImageIcon size={18} />;
    return <File size={18} />;
  };

  return (
    <div className={style.container}>
      <h4 className={style.title}>Archivos seleccionados ({files.length}):</h4>
      <div className={style.list}>
        {files.map((file, index) => (
          <div key={file.path} className={style.fileItem}>
            <span className={style.fileIndex}>{index + 1}</span>
            <span className={style.icon}>{getIcon(file.type)}</span>
            <span className={style.name} title={file.path}>
              {file.name}
            </span>
            <button
              onClick={() => onRemove(index)}
              className={style.removeButton}
              title="Eliminar"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
