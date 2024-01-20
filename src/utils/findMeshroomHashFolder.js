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
    StructureFromMotion: sfmPath + "/*/cloud_and_poses.ply",
    Meshing: meshPath + "/*/mesh.obj",
    Texturing: texturingPath + "/*/texturedMesh.obj",
  };

  return glob(fileList[modelRequest]);
}

export { findHashPath };
