import callMeshroom from "./meshroom.js";
import {
  moveImagesToWorkspace,
  setupWorkspace,
} from "../utils/workspaceSetup.js";
import { watchOutput } from "../utils/watchDirectory.js";
import callColmap from "./colmap.js";
import callOpenMVS from "./openMvs.js";
import { copyFiles } from "../utils/copyResults.js";
import { deleteAssetsFolder } from "../utils/cleaning.js";

/*
 * Startet die Rekonstruktion mit Meshroom
 */
async function meshroom(name, options) {
  const start = performance.now();
  try {
    await callMeshroom(name, options);
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

/*
 * Startet die Rekonstruktion mit Colmap und OpenMVS
 */
function colmapOpenMVS(name, options) {
  const start = performance.now();
  moveImagesToWorkspace(name);
  callColmap(name, options)
    .then(() => {
      copyFiles("model_converter", "colmap");
      callOpenMVS(name, options);
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

export async function reconstruction(name, type = "Meshroom", options) {
  setupWorkspace(name);
  deleteAssetsFolder();
  console.log("Start reconstruction");
  try {
    switch (type) {
      case "Meshroom":
        await meshroom(name, options);
        break;
      case "Colmap/OpenMVS":
        await colmapOpenMVS(name, options);
        break;
      default:
        throw new Error(`Unbekannter Rekonstruktionstyp: ${type}`);
    }
  } catch (error) {
    console.error(`${type} reconstruction failed:`, error);
  }
}
