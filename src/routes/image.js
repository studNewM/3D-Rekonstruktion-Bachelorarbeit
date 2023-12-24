import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const imageRouter = Router();
const upload = multer({ dest: 'Tempuploads/' });

imageRouter.post('/upload', upload.array('fileList'), (req, res) => {
    console.log("Lade Dateien hoch");

    const imagesDir = path.join(process.cwd(), 'images');

    if (fs.existsSync(imagesDir)) {
        fs.rmdirSync(imagesDir, { recursive: true });
    }

    fs.mkdirSync(imagesDir);

    req.files.forEach(file => {
        const newPath = path.join('images', file.originalname);
        fs.renameSync(file.path, newPath);
        console.log(file.path);

    });
    res.send('Dateien hochgeladen und verschoben');
});

export default imageRouter;