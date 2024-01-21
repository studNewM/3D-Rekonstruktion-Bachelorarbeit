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

function startMeshroom(name, run_options) {
  const start = performance.now();
  runMeshroom(name, run_options)
    .then(() => {
      watchOutput(name);
      const durationInMs = performance.now() - start;
      const durationInMin = durationInMs / 60000;
      console.log(
        `Reconstruction done. Time: ${durationInMin.toFixed(2)} minutes`,
      );
    })
    .catch((error) => console.error("Meshroom reconstruction failed:", error));
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

export function runReconstruction(name, type = "Meshroom", run_options) {
  setupWorkspace(name);
  deleteAssetsFolder();
  console.log("Start reconstruction");
  switch (type) {
    case "Meshroom":
      startMeshroom(name, run_options);
      break;
    case "Colmap/OpenMVS":
      startColmapOpenMVS(name, run_options);
      break;
  }
}
