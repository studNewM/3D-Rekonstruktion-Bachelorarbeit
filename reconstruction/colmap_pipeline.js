import path from 'node:path';
import execute_Command from '../helpers/execute_Command.js';
import deleteBinFiles from '../helpers/cleaning.js';
import fs from 'node:fs';

function run_colmap(workspace) {
    const sfm_path = path.join(workspace, "StructureFromMotion");
    if (!fs.existsSync(path.join(sfm_path, "sparse"))) {
        const sparse = path.normalize(path.join(sfm_path, "sparse"));
        fs.mkdirSync(sparse, { recursive: true });
    }

    const database = path.join(sfm_path, "database.db");
    const images = path.join(sfm_path, "images");


    const feature_extractor_command = " feature_extractor --database_path " + database + " --image_path " + images;
    const matcher_command = " exhaustive_matcher --database_path " + database;
    const mapper_command = " mapper --database_path " + database + " --image_path " + images + " --output_path " + path.join(sfm_path, "sparse");
    const undistorter_command = "image_undistorter --image_path " + images + " --input_path " + path.join(sfm_path, "sparse/0") + " --output_path " + path.join(sfm_path, "dense") + " --output_type COLMAP";
    const model_converter_command = "model_converter --input_path " + path.join(sfm_path, "dense/sparse") + " --output_path " + path.join(sfm_path, "dense/sparse") + "  --output_type TXT";




    execute_Command(feature_extractor_command, "colmap")
    console.log("Feature extraction done");

    execute_Command(matcher_command, "colmap")
    console.log("Matching done");

    execute_Command(mapper_command, "colmap")
    console.log("Mapping done");

    execute_Command(undistorter_command, "colmap")
    console.log("Undistortion done");

    execute_Command(model_converter_command, "colmap")
    console.log("Conversion done");

    deleteBinFiles(path.join(sfm_path, "dense/sparse"));

}

export default run_colmap;