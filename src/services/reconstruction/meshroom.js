import path from 'node:path';
import spawn_Command from '../../utils/spawn_command.js';

async function run_meshroom(workspace, wss) {

    const output_path = path.join(workspace, "output")
    const images = path.join(process.cwd(), "images")
    const pipeline = "photogrammetry"
    const paramOverrides = "Texturing:colorMapping.colorMappingFileType=png"
    // const meshroom_command = `-i ${images} -p ${pipeline} -o ${output_path} --cache ${workspace} --forceCompute --paramOverrides ${paramOverrides}`;
    const meshroom_command = `-i ${images} -p ${path.join(process.cwd(),'run_photogrammetry.mg')} -o ${output_path} --cache ${workspace} --forceCompute`;


    await spawn_Command(meshroom_command, "meshroom", wss, "");
}

export default run_meshroom;