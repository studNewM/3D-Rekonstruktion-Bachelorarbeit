import { findHashPath } from "../utils/findMeshroomHashFolder.js";
import fs from "fs";

async function getModelPath(req, res) {
  const modelRequest = req.query.modelRequest;
  const workspace = process.env.workingDir || "workspace";

  if (fs.existsSync(workspace)) {
    const modelPath = await findHashPath(modelRequest);

    res.send(modelPath);
  } else {
    res.status(404).send("Workspace not found");
  }
}

export { getModelPath };
