import path from 'node:path';
import execute_Command from '../helpers/execute_Command.js';
import fs from 'node:fs';



function run_openMVS(workspace) {
    const sfm_path = path.join(workspace, "StructureFromMotion");

    const openMVS_path = path.join(workspace, "openMVS");
    const openMVS_path_list = ["DensifyPointCloud", "ReconstructMesh", "RefineMesh", "TextureMesh"];


    if (!fs.existsSync(openMVS_path)) {
        fs.mkdirSync(openMVS_path);
        for (const folder of openMVS_path_list) {
            fs.mkdirSync(path.join(openMVS_path, folder));
        }
    }

    if (!fs.existsSync(path.join(openMVS_path, "images"))) {
        const oldPath = path.normalize(path.join(sfm_path, "images"))
        const newPath = path.normalize(path.join(openMVS_path, "images"));
        if (!fs.existsSync(newPath)) {
            fs.cpSync(oldPath, newPath, { recursive: true });
        }
    }


    const InterfaceCOLMAP_command = "InterfaceCOLMAP.exe --working-folder " + openMVS_path + " --input-file " + path.join(sfm_path, "dense/") + " --output-file " + path.join(openMVS_path, "model.mvs");
    const DensifyPointCloud_command = "DensifyPointCloud.exe --resolution-level 2  --working-folder " + openMVS_path + " --input-file " + path.join(openMVS_path, "model.mvs") + " --output-file " + path.join(openMVS_path, "DensifyPointCloud", "model_dense.mvs");
    const ReconstructMesh_command = "ReconstructMesh.exe --working-folder " + openMVS_path + " --input-file " + path.join(openMVS_path, "DensifyPointCloud", "model_dense.mvs") + " --output-file " + path.join(openMVS_path, "ReconstructMesh", "model_dense_mesh.mvs");
    const RefineMesh_command = "RefineMesh.exe --resolution-level 1 --working-folder " + openMVS_path + " --input-file " + path.join(openMVS_path, "ReconstructMesh", "model_dense_mesh.mvs") + " --output-file " + path.join(openMVS_path, "RefineMesh", "model_dense_mesh_refine.mvs");
    const TextureMesh_command = "TextureMesh.exe --working-folder " + openMVS_path + " --export-type obj --output-file " + path.join(openMVS_path, "TextureMesh", "model.obj") + " --input-file " + path.join(openMVS_path, "RefineMesh", "model_dense_mesh_refine.mvs");


    execute_Command(InterfaceCOLMAP_command, "openMVS")
    console.log("InterfaceCOLMAP done");

    execute_Command(DensifyPointCloud_command, "openMVS")

    console.log("DensifyPointCloud done");

    execute_Command(ReconstructMesh_command, "openMVS")
    console.log("ReconstructMesh done");

    execute_Command(RefineMesh_command, "openMVS")
    console.log("RefineMesh done");

    execute_Command(TextureMesh_command, "openMVS")
    console.log("TextureMesh done");

}
export default run_openMVS;