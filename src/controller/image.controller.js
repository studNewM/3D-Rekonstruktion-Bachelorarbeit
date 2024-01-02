import path from 'path';
import fs from 'fs';
import { processImages } from '../services/exifExtraction.js'

const upload_images = (req, res) => {
    console.log("Lade Dateien hoch");
    const imagesDir = path.join(process.cwd(), 'images');

    if (fs.existsSync(imagesDir)) {
        fs.rmSync(imagesDir, { recursive: true });
    }

    fs.mkdirSync(imagesDir);

    req.files.forEach(file => {
        const newPath = path.join('images', file.originalname);
        fs.renameSync(file.path, newPath);

    });
    res.send('Dateien hochgeladen');
}

const getMetdata = async (req, res) => {
    const cameraInfo = await processImages();
    const metadata = {
        totalCameras: Object.keys(cameraInfo).length,
        cameras: [],
        totalImages: Object.values(cameraInfo).reduce((total, info) => total + info.count, 0),

    };

    Object.entries(cameraInfo).forEach(([cameraModel, info]) => {
        metadata.cameras.push({
            combine: cameraModel,
            maker: info.maker,
            model: info.model,
            imageCount: info.count,
            focalLengths: Array.from(info.focalLengths),
            isoValues: Array.from(info.isoValues),
            imageCountsByFocalLength: info.imageCountsByFocalLength
        });
    });
    res.send(metadata);
}

export {
    upload_images,
    getMetdata
}