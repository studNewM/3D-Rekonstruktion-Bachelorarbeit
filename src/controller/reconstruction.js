import { reconstruction } from "../services/index.js";
import { webSocket } from "../services/webSocket.js";

export const triggerReconstruction = async (req, res) => {
  const model = req.body.model;
  const options = req.body.options;
  const workspace = process.env.workingDir || "workspace";

  try {
    reconstruction(workspace, model, webSocket.ws, options);
    res.sendStatus(200);
  } catch (e) {
    console.error(e.message);
    res.sendStatus(500);
  }
};
