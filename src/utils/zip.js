import fs from "fs";
import JSZip from "jszip";
import path from "path";
import { glob } from "glob";

export async function createTextureZip(model) {
  const assetsPath = path.join(process.cwd(), "public", "assets");
  const filesNamesColmapOpenMVS = ["model.obj", "model.mtl"];
  const fileNamesMeshroom = ["texturedMesh.obj", "texturedMesh.mtl"];
  let filesNames = [];
  let imageExtension = "";
  switch (model) {
    case "meshroom":
      filesNames = fileNamesMeshroom;
      imageExtension = "png";
      break;
    case "openMVS":
      filesNames = filesNamesColmapOpenMVS;
      imageExtension = "jpg";
      break;
    default:
      break;
  }
  const jpgFiles = await glob(assetsPath + `/*.${imageExtension}`, {});
  for (const file of jpgFiles) {
    filesNames.push(file.split("assets\\")[1]);
  }
  var zip = new JSZip();

  for (const file of filesNames) {
    zip.file(file, fs.readFileSync(path.join(assetsPath, file)));
  }

  zip
    .generateNodeStream({ type: "nodebuffer", streamFiles: true })
    .pipe(fs.createWriteStream(path.join(assetsPath, "texture.zip")))
    .on("finish", function () {
      console.log("texture.zip written.");
    });
}
