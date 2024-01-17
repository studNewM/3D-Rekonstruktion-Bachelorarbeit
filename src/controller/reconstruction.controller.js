import { runReconstruction } from "../services/index.js";
import { webSocket } from "../services/webSocket.js";

export const start_reconstruction = (req, res) => {
  const model_option = req.body.model;
  const run_options = req.body.options;

  try {
    runReconstruction("workspace", model_option, webSocket.ws, run_options);
  } catch (e) {
    console.error(e.message);
    res.sendStatus(500);
  }
};
