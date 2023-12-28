import { watch } from 'chokidar';
import path from 'path';
import WebSocket from 'ws';

const meshroom_steps = ['CameraInit', 'FeatureExtraction', 'ImageMatching', 'FeatureMatching', 'StructureFromMotion', 'PrepareDenseScene', 'DepthMapFilter', 'DepthMap', 'Meshing', 'MeshFiltering', 'Texturing']

const watchedDir = path.join(process.cwd(), "workspace");
let currentStep = null;


export default function watchWorkspace(wss) {
    const watcher = watch(`${watchedDir}/**`, { 
        ignored: /^\./,
        persistent: true,
        depth: 2,
    });

    watcher.on('add', path => {
        console.log(`Datei ${path} wurde hinzugefügt.`);



        const foundStep = meshroom_steps.find(step => path.includes(step));
        if (path.includes("log")) {
            if (foundStep !== currentStep) {
                if (currentStep && wss.clients) {
                    
                    wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ step: currentStep, status: 'completed' }));
                        }
                    });
                }
                console.log(`Meshroom step ${foundStep} wurde hinzugefügt.`);
                currentStep = foundStep;
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ step: currentStep, status: 'started' }));
                    }
                });
            }
        }
    });

    watcher.on('error', error => console.log(`Watcher-Fehler: ${error}`));
}