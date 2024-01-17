import { watch } from "chokidar";
import path from "path";
import sendToAllClients from "./websocketToClient.js";
import fs from "fs";
const meshroomSteps = [
  "CameraInit",
  "FeatureExtraction",
  "ImageMatching",
  "FeatureMatching",
  "StructureFromMotion",
  "PrepareDenseScene",
  "DepthMapFilter",
  "DepthMap",
  "Meshing",
  "MeshFiltering",
  "Texturing",
  "Publish",
];
const workspaceDir = path.join(process.cwd(), "workspace");

const watchWorkspace = () => {
  const watcher = watch(`${workspaceDir}/**`, {
    ignored: /^\./,
    persistent: true,
    depth: 2,
  });
  let currentStep = null;
  let currentStepStartTime = null;

  watcher.on("add", (filePath) => {
    const foundStep = meshroomSteps.find((step) => filePath.includes(step));
    console.log(`Datei ${filePath} wurde hinzugefügt.`);
    if (filePath.includes("log") && foundStep) {
      if (foundStep !== currentStep) {
        if (currentStep) {
          console.log(currentStep);
          const duration = (Date.now() - currentStepStartTime) / 1000;
          sendToAllClients({
            step: currentStep,
            status: "completed",
            time: duration,
          });
        }
        currentStep = foundStep;
        console.log(currentStep);
        currentStepStartTime = Date.now();
        sendToAllClients({ step: currentStep, status: "started" });
      }
    }
  });

  watcher.on("error", (error) => console.error(`Watcher-Fehler: ${error}`));
};

const watchOutput = (name) => {
  const outputDir = path.join(process.cwd(), name, "output");
  fs.readdir(outputDir, (err, files) => {
    if (err) {
      console.error(`Fehler beim Lesen des Verzeichnisses: ${err}`);
    } else if (files.length >= 3) {
      sendToAllClients({ step: "Publish", status: "completed" });
    }
  });
};

export { watchWorkspace, watchOutput };
