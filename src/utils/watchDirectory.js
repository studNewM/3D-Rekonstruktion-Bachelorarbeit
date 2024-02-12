import fs, { stat } from "fs";
import path from "path";
import chalk from "chalk";
import { watch } from "chokidar";
import sendToAllClients from "./websocketToClient.js";
import { meshroomSteps } from "../types/meshroomTypes.js";
import { copyFiles, checkFileWriteStatus } from "./copyResults.js";
import { createTextureZip } from "./zip.js";
import { meshroomResults } from "../types/meshroomTypes.js";
import { findHashPath } from "./findMeshroomHashFolder.js";
import * as fsStat from 'node:fs/promises';

const workspace = process.env.workingDir || "workspace";
const workspaceDir = path.join(process.cwd(), workspace);

let watcher;


function startStepLogging(foundStep) {
  console.log(chalk.white(`LOGGING: Step ${chalk.blue(foundStep)} started`));
  sendToAllClients({ step: foundStep, status: "started" });
  return { currentStep: foundStep, currentStepStartTime: Date.now() };
}

function completeStepLogging(currentStep, currentStepStartTime) {
  console.log(chalk.white(`LOGGING: Step ${chalk.blue(currentStep)} completed`));
  const duration = (Date.now() - currentStepStartTime) / 1000;
  console.log(currentStep, "completed in", duration, "seconds");
  sendToAllClients({ step: currentStep, status: "completed", time: duration });

}

function watchWorkspace() {
  watcher = watch(`${workspaceDir}/**`, { ignored: /^\./, persistent: true, depth: 2 });
  let currentStep, currentStepStartTime, missingStep;

  watcher.on("add", (filePath) => {
    const foundStep = Object.values(meshroomSteps).find((step) => filePath.includes(step));
    if (filePath.includes("log") && !filePath.includes('sfm_log') && foundStep) {
      if (foundStep !== currentStep) {
        if (currentStep) {
          if (meshroomResults[currentStep]) {
            missingStep = currentStep
            checkStepIsFinished(currentStep)
              .then(() => copyFiles(missingStep, "meshroom"))
              .then(() => completeStepLogging(missingStep, currentStepStartTime))
          }
          else { completeStepLogging(currentStep, currentStepStartTime) }
        }
      }
      ({ currentStep, currentStepStartTime } = startStepLogging(foundStep));
    }
  });
  watcher.on("error", (error) => console.error(`Watcher-Fehler: ${error}`));
}

function closeWatcher() {
  if (watcher) {
    watcher.close();
    watcher = null;
    console.log("Watcher wurde geschlossen.");
  }
}
function sortFiles(a, b) {
  const extA = path.extname(a);
  const extB = path.extname(b);
  if (extA === '.png' && extB !== '.png') return -1;
  if (extB === '.png' && extA !== '.png') return 1;
  if (extA === '.mtl' && extB !== '.mtl') return -1;
  if (extB === '.mtl' && extA !== '.mtl') return 1;
  return 0;
}
function watchOutput(name) {
  const outputDir = path.join(process.cwd(), name, "output");
  fs.readdir(outputDir, (err, files) => {
    if (err) {
      console.error(`Fehler beim Lesen des Verzeichnisses: ${err}`);
      return;
    }
    if (files.length >= 3) {

      const uniqueFilename = '_' + Date.now();
      const pngFiles = {};
      let pngBase;
      let newBase;
      files.sort(sortFiles).forEach((file) => {
        const ext = path.extname(file);
        if (ext === '.png') {
          pngBase = path.basename(file, ext);
          newBase = pngBase + uniqueFilename
          pngFiles[pngBase] = newBase
          fs.copyFileSync(path.join(outputDir, file), path.join(process.cwd(), "public", "assets", newBase + ext));
        } else if (ext === '.mtl') {
          let content = fs.readFileSync(path.join(outputDir, file), 'utf8');
          for (const pngFile of Object.keys(pngFiles)) {
            content = content.replace(new RegExp(pngFile, 'g'), pngFiles[pngFile]);
          }
          fs.writeFileSync(path.join(process.cwd(), "public", "assets", file), content);
        } else {
          fs.copyFileSync(path.join(outputDir, file), path.join(process.cwd(), "public", "assets", file));
        }
      });
      sendToAllClients({ step: "Publish", status: "completed" });
      createTextureZip("meshroom");
      closeWatcher();
    }
  });
}




async function checkStepIsFinished(step) {
  const sourceDir = await findHashPath(step);
  const fileName = meshroomResults[step][0]
  const filePath = path.join(process.cwd(), path.join(path.dirname(sourceDir[0])), fileName)
  return checkFileStability(filePath)
}


async function checkFileStability(filePath, checkDuration = 1000) {
  let lastSize = -1;
  let lastCheckTime = Date.now();

  const checkSizeChange = async () => {
    try {
      const stats = await fsStat.stat(filePath);
      console.log(stats);
      const currentTime = Date.now();
      if (stats.size === lastSize && (currentTime - lastCheckTime >= checkDuration)) {
        return true;
      } else {
        lastSize = stats.size;
        lastCheckTime = currentTime;
        await new Promise(resolve => setTimeout(resolve, checkDuration));
        return checkSizeChange();
      }
    } catch (err) {
      throw err;
    }
  };

  return checkSizeChange();
}


export { watchWorkspace, watchOutput, closeWatcher };