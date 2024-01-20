import express from "express";
import cors from "cors";
import path from "path";
import { WebSocketServer } from "ws";
import router from "./routes/index.js";
import { webSocket } from "./services/webSocket.js";

const app = express();
const port = 3000;

app.use(
  "/build/",
  express.static(path.join(process.cwd(), "node_modules/dat.gui/build")),
);
app.use(
  "/assets/",
  express.static(path.join(process.cwd(), "public", "assets")),
);

app.use(express.static("public"));

app.use(cors());
app.use(express.json());

const wss = new WebSocketServer({ noServer: true });
webSocket.ws = wss;

app.use("/", router);

const server = app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (socket) => {
    wss.emit("connection", socket, request);
  });
});
