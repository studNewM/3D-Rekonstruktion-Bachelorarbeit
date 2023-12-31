import path from 'node:path';
import fs from 'node:fs';

export default function test_move(workspace_path) {
  const oldPath = path.normalize(path.join(process.cwd(), "workspace", "images_jpg"))
  const newPath = path.normalize(path.join(workspace_path,"StructureFromMotion", "images"));
  if (!fs.existsSync(newPath)) {
    fs.cpSync(oldPath, newPath, { recursive: true });
  }
  else {
    console.log("Path does exist");
  }
}