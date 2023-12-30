import path from 'path';
import fs from 'fs'

const setupWorkspace = (name) => {
    const workspace = path.normalize(path.join(process.cwd(), name));
    if (!fs.existsSync(workspace)) {
        fs.mkdirSync(workspace);
        console.log("Workspace created");
    } else {
        console.log("Workspace does exist");
    }
}

const moveImagesToWorkspace = (workspace_path) => {
    const oldPath = path.normalize(path.join(process.cwd(), "images"))
    const newPath = path.normalize(path.join(workspace_path, "StructureFromMotion", "images"));
    if (!fs.existsSync(newPath)) {
        fs.cpSync(oldPath, newPath, { recursive: true });
    }
    else {
        console.log("Path does exist");
    }
}

export {
    setupWorkspace,
    moveImagesToWorkspace
};
