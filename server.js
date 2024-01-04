import express from 'express';
import cors from 'cors';
import router from './src/routes/index.js';
import path from 'path';
import { WebSocketServer } from 'ws';
import bodyParser from 'body-parser';


const app = express();
const port = 3000;

app.use('/build/', express.static(path.join(process.cwd(), 'node_modules/dat.gui/build')));
app.use('/assets/', express.static(path.join(process.cwd(), 'workspace', 'output')));
app.use('/assets/', express.static(path.join(process.cwd(), 'workspace', 'ConvertSFMFormat')));
app.use('/assets/', express.static(path.join(process.cwd(), 'workspace', 'Meshing')));
app.use('/assets/', express.static(path.join(process.cwd(), 'workspace', 'Texturing')));

app.use('/assets/', express.static(path.join(process.cwd(), 'workspace', 'StructureFromMotion', 'sparse', '0')));
app.use('/assets/', express.static(path.join(process.cwd(), 'workspace', 'OpenMVS', 'ReconstructMesh')));
app.use('/assets/', express.static(path.join(process.cwd(), 'workspace', 'OpenMVS', 'TextureMesh')));

app.use(express.static('public'));

app.use(cors());
app.use(bodyParser.json());

const wss = new WebSocketServer({ noServer: true });
app.locals.wss = wss;

app.use("/", router);

const server = app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, socket => {
        wss.emit('connection', socket, request);
    });
});