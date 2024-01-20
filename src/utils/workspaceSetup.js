import path from "path";
import fs from "fs";

const setupWorkspace = (name) => {
  const workspace = path.normalize(path.join(process.cwd(), name));
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
};

const moveImagesToWorkspace = (workspace_path) => {
  const oldPath = path.normalize(path.join(process.cwd(), "images"));
  const newPath = path.normalize(
    path.join(workspace_path, "StructureFromMotion", "images"),
  );
  if (!fs.existsSync(newPath)) {
    fs.cpSync(oldPath, newPath, { recursive: true });
  } else {
    console.log("Path does exist");
  }
};

export { setupWorkspace, moveImagesToWorkspace };
