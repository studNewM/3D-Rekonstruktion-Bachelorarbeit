import path from "path";
import fs from "fs";

function setupWorkspace(name) {
  const workspace = path.join(process.cwd(), name);
  if (fs.existsSync(workspace)) {
    console.log(`${workspace} already exists`);
    fs.rmSync(workspace, { recursive: true }, (err) => {
      if (err) {
        throw err;
      }
    });
  }
  fs.mkdirSync(workspace);
  console.log(`${workspace} created`);
  setupAssets();
}

function setupAssets() {
  const assets = path.join(process.cwd(), "public", "assets");
  if (!fs.existsSync(assets)) {
    fs.mkdirSync(assets);
    console.log(`${assets} created`);
  }
}

function moveImagesToWorkspace(workspace_path) {
  const oldPath = path.normalize(path.join(process.cwd(), "images"));
  const newPath = path.normalize(
    path.join(workspace_path, "StructureFromMotion", "images"),
  );
  if (!fs.existsSync(newPath)) {
    fs.cpSync(oldPath, newPath, { recursive: true });
  } else {
    console.log("Path does exist");
  }
}

export { setupWorkspace, moveImagesToWorkspace };
