import path from 'node:path';
import deleteBinFiles from '../../utils/cleaning.js';


import fs from 'node:fs';
import spawn_Command from '../../utils/spawn_command.js';

async function run_colmap(workspace, wss) {

    const sfm_path = path.join(workspace, "StructureFromMotion");

    if (!fs.existsSync(path.join(sfm_path, "sparse"))) {
        const sparse = path.normalize(path.join(sfm_path, "sparse"));
        fs.mkdirSync(sparse, { recursive: true });
    }

    const database = path.join(sfm_path, "database.db");
    const images = path.join(sfm_path, "images");

    const feature_extractor_command = "feature_extractor --database_path " + database + " --image_path " + images;
    const matcher_command = "exhaustive_matcher --database_path " + database;
    const mapper_command = "mapper --database_path " + database + " --image_path " + images + " --output_path " + path.join(sfm_path, "sparse");
    const undistorter_command = "image_undistorter --image_path " + images + " --input_path " + path.join(sfm_path, "sparse/0") + " --output_path " + path.join(sfm_path, "dense") + " --output_type COLMAP";
    const model_converter_command = "model_converter --input_path " + path.join(sfm_path, "dense/sparse") + " --output_path " + path.join(sfm_path, "dense/sparse") + "  --output_type TXT";

    async function executeAndLog(command, message, wss) {
        await spawn_Command(command, "colmap", wss);
        return console.log(`${message} done`);
    }
    return executeAndLog(feature_extractor_command, "Feature extraction", wss)
        .then(() => executeAndLog(matcher_command, "Matching", wss))
        .then(() => executeAndLog(mapper_command, "Mapping", wss))
        .then(() => executeAndLog(undistorter_command, "Undistortion", wss))
        .then(() => executeAndLog(model_converter_command, "Model conversion", wss))
        .then(() => deleteBinFiles(path.join(sfm_path, "dense/sparse")));
}

export default run_colmap;