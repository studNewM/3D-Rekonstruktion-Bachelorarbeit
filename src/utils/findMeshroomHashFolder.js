import { glob } from "glob";
import path from "path";

async function findHashPath(modelRequest) {
  const workspace = path.join(
    process.cwd(),
    process.env.workingDirName || "workspace",
  );
  const sfmPath = path.join(workspace, "StructureFromMotion");
  const meshPath = path.join(workspace, "Meshing");
  const texturingPath = path.join(workspace, "Texturing");
  const fileList = {
    StructureFromMotion: sfmPath + '/**/log',
    Meshing: meshPath + '/**/log',
    Texturing: texturingPath + '/**/log',
  };
  try {
    return await glob(fileList[modelRequest]);
  } catch (error) {
    console.error('Error with glob:', error);
  }

}

export { findHashPath };
