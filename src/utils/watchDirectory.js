import fs from "fs";
import { copyFileSync } from "fs";
import path from "path";
import chalk from "chalk";
import { watch, FSWatcher } from "chokidar";
import sendToAllClients from "./websocketToClient.js";
import { meshroomSteps } from "../types/meshroomTypes.js";
import { copyFiles } from "./copyResults.js";
import { createTextureZip } from "./zip.js";
const workspace = process.env.workingDir || "workspace";
const workspaceDir = path.join(process.cwd(), workspace);

let watcher;

function watchWorkspace() {
  watcher = watch(`${workspaceDir}/**`, {
    ignored: /^\./,
    persistent: true,
    depth: 2,
  });
  let currentStep = null;
  let currentStepStartTime = null;

  watcher.on("add", (filePath) => {
    const foundStep = Object.values(meshroomSteps).find((step) =>
      filePath.includes(step),
    );
    if (filePath.includes("log") && foundStep) {
      if (foundStep !== currentStep) {
        if (currentStep) {
          console.log(
            chalk.white(`LOGGING: Step ${chalk.blue(currentStep)} completed`),
          );
          copyFiles(currentStep, "meshroom");
          const duration = (Date.now() - currentStepStartTime) / 1000;
          sendToAllClients({
            step: currentStep,
            status: "completed",
            time: duration,
          });
        }
      }
      currentStep = foundStep;
      console.log(
        chalk.white(`LOGGING: Step ${chalk.blue(currentStep)} started`),
      );
      currentStepStartTime = Date.now();
      sendToAllClients({ step: currentStep, status: "started" });
    }
  }
  );
  watcher.on("error", (error) => console.error(`Watcher-Fehler: ${error}`));
};

function closeWatcher() {
  if (watcher) {
    watcher.close();
  }

};
function watchOutput(name) {
  const outputDir = path.join(process.cwd(), name, "output");
  fs.readdir(outputDir, (err, files) => {
    if (err) {
      console.error(`Fehler beim Lesen des Verzeichnisses: ${err}`);
    } else if (files.length >= 3) {
      sendToAllClients({ step: "Publish", status: "completed" });
      files.forEach((file) =>
        copyFileSync(
          path.join(outputDir, file),
          path.join(process.cwd(), "public", "assets", file),
        ),
      );
      createTextureZip("meshroom");
      closeWatcher();
    }
  });
};

export { watchWorkspace, watchOutput };
