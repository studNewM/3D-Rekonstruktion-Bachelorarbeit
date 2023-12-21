import path from 'path';
import fs from 'fs';
import run_colmap from './colmap_pipeline.js';
import run_openMVS from './openmvs_pipline.js';
import run_meshroom from './meshroom.js';
import test_move from '../helpers/move_images_for_testing.js';


function reconstruction_pipeline_colmap_openmvs(reconstruction_path) {
    run_colmap(reconstruction_path);
    run_openMVS(reconstruction_path);
}

function reconstruction_meshroom(reconstruction_path) {
    run_meshroom(reconstruction_path);
}


export default function run_reconstruction(name = "workspace", type = "colmap_openmvs") {
    const workspace = path.normalize(path.join(process.cwd(), name));

    if (!fs.existsSync(workspace)) {
        fs.mkdirSync(workspace);
    }

    test_move(workspace);


    if (type == "meshroom") {
        reconstruction_meshroom(workspace);
    } else {
        reconstruction_pipeline_colmap_openmvs(workspace);
    }
}

