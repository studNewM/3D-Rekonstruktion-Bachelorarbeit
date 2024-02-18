import path from "node:path";
import fs from "node:fs";
import chalk from "chalk";
import spawn_Command from "../utils/spawn.js";
import { copyFiles } from "../utils/copyResults.js";

function callOpenMVS(name, options) {
  const cuda_device = options.cuda_device ? -2 : -1;
  const workspace = path.join(process.cwd(), name);
  const sfm_path = path.join(workspace, "StructureFromMotion");

  const openMVS_path = path.join(workspace, "openMVS");
  const openMVS_path_list = [
    "DensifyPointCloud",
    "ReconstructMesh",
    "RefineMesh",
    "TextureMesh",
  ];

  if (!fs.existsSync(openMVS_path)) {
    fs.mkdirSync(openMVS_path);
    for (const folder of openMVS_path_list) {
      fs.mkdirSync(path.join(openMVS_path, folder));
    }
  }

  if (!fs.existsSync(path.join(openMVS_path, "images"))) {
    const oldPath = path.normalize(path.join(sfm_path, "images"));
    const newPath = path.normalize(path.join(openMVS_path, "images"));
    if (!fs.existsSync(newPath)) {
      fs.cpSync(oldPath, newPath, { recursive: true });
    }
  }

  const InterfaceCOLMAP_command =
    "InterfaceCOLMAP.exe --working-folder " +
    openMVS_path +
    " --input-file " +
    path.join(sfm_path, "dense/") +
    " --output-file " +
    path.join(openMVS_path, "model.mvs");
  const DensifyPointCloud_command =
    "DensifyPointCloud.exe --resolution-level 2" +
    " --working-folder " +
    openMVS_path +
    " --input-file " +
    path.join(openMVS_path, "model.mvs") +
    " --output-file " +
    path.join(
      openMVS_path,
      "DensifyPointCloud",
      "model_dense.mvs" + ` --cuda-device ${cuda_device}`,
    );
  const ReconstructMesh_command =
    "ReconstructMesh.exe --working-folder " +
    openMVS_path +
    " --input-file " +
    path.join(openMVS_path, "DensifyPointCloud", "model_dense.mvs") +
    " --output-file " +
    path.join(openMVS_path, "ReconstructMesh", "model_dense_mesh.mvs");
  const RefineMesh_command =
    "RefineMesh.exe --resolution-level 1 --working-folder " +
    openMVS_path +
    " --input-file " +
    path.join(openMVS_path, "ReconstructMesh", "model_dense_mesh.mvs") +
    " --output-file " +
    path.join(openMVS_path, "RefineMesh", "model_dense_mesh_refine.mvs");
  const TextureMesh_command =
    "TextureMesh.exe --working-folder " +
    openMVS_path +
    " --export-type obj --output-file " +
    path.join(openMVS_path, "TextureMesh", "model.obj") +
    " --input-file " +
    path.join(openMVS_path, "RefineMesh", "model_dense_mesh_refine.mvs");

  async function executeAndLog(command, message) {
    await spawn_Command(command, "openMVS", message);
    console.log(`${chalk.blue(message)} done`);
    copyFiles(message, "openMVS");
  }
  executeAndLog(InterfaceCOLMAP_command, "InterfaceCOLMAP")
    .then(() => executeAndLog(DensifyPointCloud_command, "DensifyPointCloud"))
    .then(() => executeAndLog(ReconstructMesh_command, "ReconstructMesh"))
    .then(() => executeAndLog(RefineMesh_command, "RefineMesh"))
    .then(() => executeAndLog(TextureMesh_command, "TextureMesh"));
}
export default callOpenMVS;
