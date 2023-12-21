import path from 'node:path';
import fs from 'node:fs';
import run_colmap from './reconstruction/colmap_pipeline.js';
import run_openMVS from './reconstruction/openmvs_pipline.js';
import test_move from './helpers/move_images_for_testing.js';


function reconstruction(reconstruction_path) {
    run_colmap(reconstruction_path);
    run_openMVS(reconstruction_path);
}


export default function run_colmap_openmvs() {
    const name = "workspace_6_jpg";
    const workspace = path.normalize(path.join(process.cwd(), name));

    if (!fs.existsSync(workspace)) {
        fs.mkdirSync(workspace);
    }

    test_move(workspace);
    reconstruction(workspace);

}

