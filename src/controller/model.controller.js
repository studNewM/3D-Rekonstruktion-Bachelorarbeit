import { glob } from 'glob'
import path from 'path'
import fs from 'fs'
export const getModelPath = async (req, res) => {
    const modelRequest = req.query.modelRequest;
    const workspace = path.join(process.cwd(), 'workspace');
    const sfmPath = path.join(workspace, 'ConvertSFMFormat');
    const meshPath = path.join(workspace, 'Meshing');
    const texturingPath = path.join(workspace, 'Texturing');
    const fileList = {
        StructureFromMotion: sfmPath + '/*/sfm.ply', Meshing: meshPath + '/*/mesh.obj', Texturing: texturingPath + '/*/texturedMesh.obj'
    }

    if (fs.existsSync(workspace)) {
        const modelPath = await glob(fileList[modelRequest])

        res.send(modelPath);
    } else {
        res.status(404).send('Workspace not found');
    }
}