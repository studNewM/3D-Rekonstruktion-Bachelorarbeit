import { copyFileSync, readdir } from "fs";
import chokidar from "chokidar";
import path from "path";
import { createTextureZip } from "./zip.js";
import { findHashPath } from "./findMeshroomHashFolder.js";
import { meshroomResults } from "../types/meshroomTypes.js";
import {
  colmapOpenMvsResultPaths,
  colmapOpenMvsResult,
} from "../types/colmapOpenMvsTypes.js";



function copyFolder() {
  const outputDir = path.join(
    process.cwd(),
    "workspace",
    "openMVS",
    "TextureMesh",
  );
  readdir(outputDir, (err, files) => {
    files.forEach((file) =>
      copyFileSync(
        path.join(outputDir, file),
        path.join(process.cwd(), "public", "assets", file),
      ),
    );
  });
}

/*
* Kopiert die Punktewolke und das Mesh in den Ordner assets
* Kopiert alle Texturdateien in den Ordner assets und erstellt ein Zip-Archiv
*/
async function copyFiles(type, model) {
  let arrayValues = [];
  let arrayKeys = {};
  if (model === "meshroom") {
    arrayValues = Object.keys(meshroomResults);
    arrayKeys = meshroomResults;
  } else {
    arrayValues = Object.keys(colmapOpenMvsResult);
    arrayKeys = colmapOpenMvsResult;
  }
  if (arrayValues.includes(type)) {
    const destinationDir = path.join(process.cwd(), "public", "assets");
    let sourceDir = [];
    if (model === "meshroom") {
      sourceDir = await findHashPath(type);
    } else if (type !== "TextureMesh") {
      const sourcePath = path.join(
        "workspace",
        colmapOpenMvsResultPaths[type],
      );
      sourceDir = [sourcePath];
    }
    const fileName = arrayKeys[type][0];
    const destinationPath = path.join(destinationDir, fileName);
    try {
      if (type === "TextureMesh") {
        copyFolder();
        await createTextureZip("openMVS");
      } else {
        const filePath = path.join(process.cwd(), path.join(path.dirname(sourceDir[0])), fileName)
        copyFileSync(filePath, destinationPath);
        console.log(`Die Datei "${filePath}" wurde erfolgreich kopiert.`);
      }
    } catch (err) {
      console.error(
        `Fehler beim Kopieren der Datei "${fileName}": ${err.message}`,
      );
    }
  }
}

/*
* Überprüft, ob die Datei fertig geschrieben wurde
*/
function checkFileWriteStatus(filePath) {
  return new Promise((resolve, reject) => {
    const file = path.dirname(filePath);
    const watcher = chokidar.watch(file, {
      ignored: /(^|[\/\\])\../,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    watcher.on('change', (path, stats) => {
      if (stats) {
        console.log(`File ${path} changed size to ${stats.size}`);
      }
      watcher.close();
      resolve(true);
    });

    watcher.on('error', error => {
      console.error(`Watcher error: ${error}`);
      watcher.close();
      reject(error);
    });
  });
}
export { copyFiles, checkFileWriteStatus };
