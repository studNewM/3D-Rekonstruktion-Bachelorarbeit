import runMeshroom from "./meshroom.js";
import { moveImagesToWorkspace, setupWorkspace } from "../utils/workspaceSetup.js";
import { watchOutput } from "../utils/watchDirectory.js";
import runColmap from './colmap_pipeline.js'
import runOpenMVS from './openmvs_pipeline.js'
/**
 * Führt die Rekonstruktion mit Meshroom oder Colmap und OpenMVS durch.
 * - Meshroom sollte verwendet werden wenn eine normale GPU vorhanden ist.
 * - Colmap/OpenMVS wird nur empfohlen, wenn eine leistungsfähige Grafikkarte verfügbar ist.
 * 
 * @param {string} name - Name des Arbeitsbereichs.
 * @param {string} type - Typ der Rekonstruktion, entweder "Meshroom" oder "Colmap/OpenMVS".
 * @param {WebSocket} wss - WebSocket-Serverinstanz.
 */

const start = performance.now();
export const runReconstruction = (name = "workspace", type = "Colmap/OpenMVS", wss) => {
    setupWorkspace(name);
    console.log("Start reconstruction");

    if (type === "Meshroom") {
        runMeshroom(name, wss)
            .then(() => {
                watchOutput(name, wss);
                const durationInMs = performance.now() - start;
                const durationInMin = durationInMs / 60000;
                console.log(`Reconstruction done. Time: ${durationInMin.toFixed(2)} minutes`)
            })
            .catch(error => console.error("Meshroom reconstruction failed:", error));
    } else {
        moveImagesToWorkspace(name);
        runColmap(name, wss)
            .then(() => {
                runOpenMVS(name, wss)
                const durationInMs = performance.now() - start;
                const durationInMin = durationInMs / 60000;
                console.log(`Reconstruction done. Time: ${durationInMin.toFixed(2)} minutes`)
            })
            .catch(error => console.error("Colmap/OpenMVS reconstruction failed:", error));
    }
};
