import path from 'path';
import fs from 'fs';
import run_colmap from './colmap_pipeline.js';
import run_openMVS from './openmvs_pipline.js';
import run_meshroom from './meshroom.js';
import move_images_to_workspace from '../../utils/move_images.js';


function setWorkspace(workspace) {
    if (!fs.existsSync(workspace)) {
        fs.mkdirSync(workspace);
    }
}


export default function run_reconstruction(name = "workspace", type = "Colmap/OpenMVS", wss) {

    const workspace = path.normalize(path.join(process.cwd(), name));
    setWorkspace(workspace);
    console.log("Start reconstruction");


    if (type == "Meshroom") {
        run_meshroom(workspace, wss).then(() => {
            console.log("Reconstruction done");
        });

    } else {
        move_images_to_workspace(workspace);
        run_colmap(workspace, wss).then(() => {
            // run_openMVS(workspace, wss);
        });

    }
}

