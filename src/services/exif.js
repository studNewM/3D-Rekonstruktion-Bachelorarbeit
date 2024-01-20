import { promises as fs } from "fs";
import exifr from "exifr";

const imagesDir = "images";

export async function processImages() {
  try {
    const files = await fs.readdir(imagesDir);
    const cameraInfo = {};

    for (const file of files) {
      const exifData = await exifr.parse(`${imagesDir}/${file}`);
      if (exifData) {
        const make = exifData.Make || "Unbekannt";
        const lensModel = exifData.LensModel || "";
        const model = exifData.Model || "Modell";
        const cameraModel = `${make}${lensModel ? ` - ${lensModel}` : ` - ${model}`}`;
        const focalLength = exifData.FocalLength
          ? exifData.FocalLength + "mm"
          : "Unbekannt";
        const iso = `ISO ${exifData.ISO || "Unbekannt"}`;

        if (!cameraInfo[cameraModel]) {
          cameraInfo[cameraModel] = {
            maker: make,
            model: lensModel ? lensModel : model,
            focalLengths: new Set(),
            isoValues: new Set(),
            imageCountsByFocalLength: {},
            count: 0,
          };
        }

        cameraInfo[cameraModel].focalLengths.add(focalLength);
        cameraInfo[cameraModel].isoValues.add(iso);
        cameraInfo[cameraModel].count++;

        if (!cameraInfo[cameraModel].imageCountsByFocalLength[focalLength]) {
          cameraInfo[cameraModel].imageCountsByFocalLength[focalLength] = 0;
        }
        cameraInfo[cameraModel].imageCountsByFocalLength[focalLength]++;
      }
    }
    return cameraInfo;
  } catch (err) {
    console.error("Fehler:", err);
  }
}
