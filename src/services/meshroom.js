import path from "node:path";
import spawnCommand from "../utils/spawn.js";

async function runMeshroom(workspace) {
  const workspacePath = path.join(process.cwd(), workspace);
  const outputPath = path.join(workspacePath, "output");
  const imagesPath = path.join(process.cwd(), "images");
  const pipelinePath = path.join(process.cwd(), "run_photogrammetry.mg");
  const meshroomOptions = `-i ${imagesPath} -p ${pipelinePath} -o ${outputPath} --cache ${workspacePath} --forceCompute`;

  try {
    await spawnCommand(meshroomOptions, "meshroom", "");
  } catch (error) {
    console.error("Meshroom execution failed:", error);
  }
}

export default runMeshroom;
