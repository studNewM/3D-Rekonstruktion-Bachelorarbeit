import path from 'node:path';
import execute_Command from '../helpers/execute_Command.js';
import fs from 'node:fs';

function run_meshroom(workspace) {
    const output_path = path.join(workspace, "output")
    const images = path.join(process.cwd(), "images", "images_jpg")
    const pipeline = "photogrammetry"
    const meshroom_command = "-i " + images + " -p " + pipeline + " -o " + output_path + " --cache " + workspace;


    execute_Command(meshroom_command, "meshroom")
    console.log("Run done");


}

export default run_meshroom;