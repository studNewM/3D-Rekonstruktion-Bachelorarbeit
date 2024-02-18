import path from "node:path";
import fs from "node:fs";

/*
* Löscht alle .bin-Dateien in dem  Verzeichnis
*/
async function deleteBinFiles(directory) {
  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      if (path.extname(file) === ".bin") {
        fs.unlink(path.join(directory, file), (err) => {
          if (err) throw err;
        });
      }
    }
  });
}

/*
* Löscht alle erstellten Modelle im Ordner assets
*/
function deleteAssetsFolder() {
  const assetsPath = path.join(process.cwd(), "public", "assets");

  fs.readdir(assetsPath, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      const filePath = path.join(assetsPath, file);
      fs.unlink(filePath, (err) => {
        if (err) throw err;
        console.log(`${filePath} was deleted`);
      });
    }
  });
}

export { deleteAssetsFolder, deleteBinFiles };
