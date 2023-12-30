import { runReconstruction } from '../services/index.js';


export const start_reconstruction = (req, res) => {
    const wss = req.app.locals.wss;
    const model_option = req.body.model;

    try {
        runReconstruction("workspace", model_option, wss);

    } catch (e) {
        console.log(e.message)
        res.sendStatus(500)
    }
}


