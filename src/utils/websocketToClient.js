import WebSocket from "ws";
import { webSocket } from "../services/webSocket.js";

export default function sendToAllClients(message) {
  console.log("Clients: ", webSocket.ws.clients.size);
  webSocket.ws.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}
