import path from "node:path";
import fs from "node:fs/promises";
import chalk from "chalk";
import spawnCommand from "../utils/spawn.js";
import { deleteBinFiles } from "../utils/cleaning.js";

async function executeAndLog(command, message) {
  await spawnCommand(command, "colmap", message);
  console.log(`${chalk.blue(message)} done`);
}

async function checkFolder(folder) {
  try {
    await fs.access(folder);
  } catch (error) {
    await fs.mkdir(folder, { recursive: true });
  }
}

async function callColmap(name) {
  const workspace = path.join(process.cwd(), name);
  const sfmPath = path.join(workspace, "StructureFromMotion");
  const sparsePath = path.join(sfmPath, "sparse");
  const databasePath = path.join(sfmPath, "database.db");
  const imagesPath = path.join(sfmPath, "images");
  const densePath = path.join(sfmPath, "dense");
  const denseSparsePath = path.join(densePath, "sparse");

  try {
    await checkFolder(sparsePath);

    const commands = [
      `feature_extractor --database_path ${databasePath} --image_path ${imagesPath}`,
      `exhaustive_matcher --database_path ${databasePath}`,
      `mapper --database_path ${databasePath} --image_path ${imagesPath} --output_path ${sparsePath}`,
      `model_converter --input_path ${path.join(sparsePath, "0")} --output_path ${path.join(sparsePath, "0", "sfm.ply")} --output_type ply`,
      `image_undistorter --image_path ${imagesPath} --input_path ${path.join(sparsePath, "0")} --output_path ${densePath}`,
      `model_converter --input_path ${denseSparsePath} --output_path ${denseSparsePath} --output_type TXT`,
    ];

    for (const command of commands) {
      const stepName = command.split(" ")[0];
      await executeAndLog(command, stepName);
    }

    await deleteBinFiles(denseSparsePath);
  } catch (error) {
    console.error("Error running Colmap:", error);
    throw error;
  }
}

export default callColmap;
