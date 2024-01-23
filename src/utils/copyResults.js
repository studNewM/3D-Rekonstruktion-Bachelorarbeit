import { copyFileSync, readdir } from "fs";
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
    let sourceDir = "";
    if (model === "meshroom") {
      sourceDir = await findHashPath(type);
    } else if (type !== "TextureMesh") {
      const sourcePath = path.join(
        process.cwd(),
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
        copyFileSync(sourceDir[0], destinationPath);
        console.log(`Die Datei "${fileName}" wurde erfolgreich kopiert.`);
      }
    } catch (err) {
      console.error(
        `Fehler beim Kopieren der Datei "${fileName}": ${err.message}`,
      );
    }
  }
}

export { copyFiles };
