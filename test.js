import path from "path";
const sfm_path = path.join("./", "StructureFromMotion");

const openMVS_path = path.join("./", "openMVS");
const openMVS_path_list = ["DensifyPointCloud", "ReconstructMesh", "RefineMesh", "TextureMesh"];



const InterfaceCOLMAP_command = "InterfaceCOLMAP.exe --working-folder " + openMVS_path + "--input-file" + path.join(sfm_path, "dense/") + " --output-file " + path.join(openMVS_path, "model.mvs");
const DensifyPointCloud_command = "DensifyPointCloud.exe --resolution-level" + "2" + "--working-folder" + openMVS_path + " --input-file " + path.join(openMVS_path, "model.mvs") + " --output-file " + path.join(openMVS_path, "DensifyPointCloud", "model_dense.mvs");


console.log(InterfaceCOLMAP_command.split(" "));