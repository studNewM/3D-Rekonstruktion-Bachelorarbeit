import { glob } from "glob";
import path from "path";

async function findHashPath(modelRequest) {
  const workspace = path.join(
    process.cwd(),
    process.env.workingDirName || "workspace",
  );
  const fileList = `${path.join(workspace, modelRequest)}` + '/**/log';
  try {
    return await glob(fileList);
  } catch (error) {
    console.error('Error with glob:', error);
  }

}

export { findHashPath };
