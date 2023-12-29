import { Router } from 'express';
import path from 'path';
import run_reconstruction from '../services/reconstruction/index.js';
const modelRouter = Router();

modelRouter.post('/reconstruction', (req, res) => {
    const wss = req.app.locals.wss;
    const model_option = req.body.model;
    res.json({ message: 'Prozess gestartet' });
    run_reconstruction("workspace", model_option, wss);
});


export default modelRouter;