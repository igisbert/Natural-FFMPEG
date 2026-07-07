import { getCurrentWebview } from "@tauri-apps/api/webview";

export const allowDragAndDrop = async ({
  onDrop,
  onDragEnter,
  onDragLeave,
}) => {
  const unlisten = await getCurrentWebview().onDragDropEvent((event) => {
    switch (event.payload.type) {
      case "enter":
        if (onDragEnter) onDragEnter(event.payload.paths);
        break;
      case "leave":
        if (onDragLeave) onDragLeave();
        break;
      case "drop":
        if (onDrop && event.payload.paths.length > 0) {
          onDrop(event.payload.paths);
        }
        if (onDragLeave) onDragLeave();
        break;
    }
  });

  return unlisten;
};
