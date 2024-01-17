import path from "node:path";
import spawnCommand from "../utils/spawn_command.js";

/**
 * Führt Meshroom mit den gegebenen Parametern aus.
 * @param {string} workspace - Der Arbeitsbereichspfad, in dem die Ausführung stattfinden soll.
 * @param {WebSocket} wss - WebSocket-Serverinstanz.
 */
async function runMeshroom(workspace) {
  const workspacePath = path.join(process.cwd(), workspace);
  const outputPath = path.join(workspacePath, "output");
  const imagesPath = path.join(process.cwd(), "images");
  const pipelinePath = path.join(process.cwd(), "run_photogrammetry.mg");
  const meshroomOptions = `-i ${imagesPath} -p ${pipelinePath} -o ${outputPath} --cache ${workspacePath} --forceCompute`;

  try {
    await spawnCommand(meshroomOptions, "meshroom", "");
  } catch (error) {
    console.error("Meshroom execution failed:", error);
  }
}

export default runMeshroom;
