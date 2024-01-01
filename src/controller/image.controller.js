import path from 'path';
import fs from 'fs';


export const upload_images = (req, res) => {
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