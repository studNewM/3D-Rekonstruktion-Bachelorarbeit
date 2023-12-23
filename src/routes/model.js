import { Router } from 'express';
import run_reconstruction from '../services/reconstruction/index.js';
const modelRouter = Router();

modelRouter.post('/reconstruction', (req, res) => {
    const wss = req.app.locals.wss;
    res.json({ message: 'Prozess gestartet' });

    //TODO: get body from request
    console.log('body is ', req.body);
    run_reconstruction("workspace", "", wss);
});

export default modelRouter;