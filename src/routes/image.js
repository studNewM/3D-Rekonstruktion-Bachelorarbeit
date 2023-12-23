import { Router } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const imageRouter = Router();
const upload = multer({ dest: 'Tempuploads/' });

imageRouter.post('/upload', upload.array('fileList'), (req, res) => {
    console.log("object");
    req.files.forEach(file => {
        const newPath = path.join('imageFolder', file.originalname);
        fs.renameSync(file.path, newPath);
        console.log(file.path);

    });
    res.send('Dateien hochgeladen und verschoben');
});

export default imageRouter;