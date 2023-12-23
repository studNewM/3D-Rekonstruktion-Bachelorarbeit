import express from 'express';
import cors from 'cors';
import router from './src/routes/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static('public'));
app.use(cors());

const wss = new WebSocketServer({ noServer: true });
app.locals.wss = wss; // Speichern des WebSocket-Servers in app.locals


app.use("/", router)
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));

app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));

const server = app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, socket => {
        wss.emit('connection', socket, request);
    });
});






