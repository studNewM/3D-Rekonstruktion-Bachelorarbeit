import path from "path";
import fs from "fs";
import { processImages } from "../services/exif.js";

function uploadImages(req, res) {
  console.log("Lade Dateien hoch");
  const imagesDir = path.join(process.cwd(), "images");

  if (fs.existsSync(imagesDir)) {
    fs.rmSync(imagesDir, { recursive: true });
  }

  fs.mkdirSync(imagesDir);

  req.files.forEach((file) => {
    const newPath = path.join("images", file.originalname);
    fs.renameSync(file.path, newPath);
  });
  res.send("Dateien hochgeladen");
}

function deleteImages(req, res) {
  const images = req.body.images;
  if (images.length !== 0) {
    images.forEach((image) => {
      const imagePath = path.join(process.cwd(), "images", image);
      if (fs.existsSync(imagePath)) {
        fs.rmSync(imagePath);
      }
    });
    res.send("Dateien gelöscht");
  } else {
    res.send("Keine Dateien zum löschen ausgewählt");
  }
}

async function getMetdata(req, res) {
  const cameraInfo = await processImages();
  const metadata = {
    totalCameras: Object.keys(cameraInfo).length,
    cameras: [],
    totalImages: Object.values(cameraInfo).reduce(
      (total, info) => total + info.count,
      0,
    ),
  };

  Object.entries(cameraInfo).forEach(([cameraModel, info]) => {
    metadata.cameras.push({
      combine: cameraModel,
      maker: info.maker,
      model: info.model,
      imageCount: info.count,
      focalLengths: Array.from(info.focalLengths),
      isoValues: Array.from(info.isoValues),
      imageCountsByFocalLength: info.imageCountsByFocalLength,
    });
  });
  res.send(metadata);
}

export { uploadImages, getMetdata, deleteImages };