import runMeshroom from "./meshroom.js";
import {
  moveImagesToWorkspace,
  setupWorkspace,
} from "../utils/workspaceSetup.js";
import { watchOutput } from "../utils/watchDirectory.js";
import runColmap from "./colmap.js";
import runOpenMVS from "./openMvs.js";
import { copyFiles } from "../utils/copyResults.js";
import { deleteAssetsFolder } from "../utils/cleaning.js";

async function startMeshroom(name, run_options) {
  const start = performance.now();
  try {
    await runMeshroom(name, run_options);
    watchOutput(name);
    const durationInMs = performance.now() - start;
    const durationInMin = durationInMs / 60000;
    console.log(
      `Reconstruction done. Time: ${durationInMin.toFixed(2)} minutes`,
    );
  } catch (error) {
    console.error("Meshroom reconstruction failed:", error);
  }
}

function startColmapOpenMVS(name, run_options) {
  const start = performance.now();
  moveImagesToWorkspace(name);
  runColmap(name, run_options)
    .then(() => {
      copyFiles("model_converter", "colmap");
      runOpenMVS(name, run_options);
      const durationInMs = performance.now() - start;
      const durationInMin = durationInMs / 60000;
      console.log(
        `Reconstruction done. Time: ${durationInMin.toFixed(2)} minutes`,
      );
    })
    .catch((error) =>
      console.error("Colmap/OpenMVS reconstruction failed:", error),
    );
}

export async function runReconstruction(name, type = "Meshroom", run_options) {
  setupWorkspace(name);
  deleteAssetsFolder();
  console.log("Start reconstruction");
  try {
    switch (type) {
      case "Meshroom":
        await startMeshroom(name, run_options);
        break;
      case "Colmap/OpenMVS":
        await startColmapOpenMVS(name, run_options);
        break;
      default:
        throw new Error(`Unbekannter Rekonstruktionstyp: ${type}`);
    }
  } catch (error) {
    console.error(`${type} reconstruction failed:`, error);
  }
}
