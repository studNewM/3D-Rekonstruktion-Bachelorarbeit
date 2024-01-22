import { activateProgressBar, handleProcessCompletion } from "./progressBar.js";
import {
  handleCheckboxChange,
  enableReconstructionButtons,
  triggerDisplayAction,
} from "./reconstruction.js";

function setupWebSocketConnection() {
  const ws = new WebSocket("ws://localhost:3000");
  ws.onopen = onWebSocketOpen;
  ws.onmessage = onWebSocketMessage;
  ws.onerror = onWebSocketError;
  ws.onclose = onWebSocketClose;
}
function onWebSocketOpen() {
  console.log("WebSocket-Verbindung geöffnet");
}
function onWebSocketMessage(event) {
  const data = JSON.parse(event.data);
  const processElement = document.getElementById(`progress-${data.step}-line`);
  const pipelineOptions = handleCheckboxChange();

  switch (data.status) {
    case "started":
      activateProgressBar(data.step);
      break;
    case "completed":
      window.completedImageCount++;
      if (processElement.style.backgroundColor !== "red") {
        processElement.style = "";
        processElement.style.backgroundColor = "green";
        processElement.style.height = "100%";
        processElement.style.width = "100%";
      }
      handleProcessCompletion(data.step);
      enableReconstructionButtons(data.step);
      if (pipelineOptions["Zwischenergebnisse laden"] === true) {
        triggerDisplayAction(data.step);
      }
      break;
    case "failed":
      processElement.style = "";
      processElement.style.backgroundColor = "red";
      alert(`${data.step} fehlgeschlagen:\n${data.message}`);
      break;
    case "ERROR":
      processElement.style = "";
      processElement.style.backgroundColor = "red";
      alert(`${data.step} fehlgeschlagen:\n${data.message}`);
      break;
    default:
      console.warn("Unbekannter Status:", data.status);
  }
}
function onWebSocketError(error) {
  console.error("WebSocket-Fehler:", error);
}
function onWebSocketClose() {
  console.log("WebSocket-Verbindung geschlossen");
}
export {
  setupWebSocketConnection,
  onWebSocketOpen,
  onWebSocketMessage,
  onWebSocketError,
  onWebSocketClose,
};
