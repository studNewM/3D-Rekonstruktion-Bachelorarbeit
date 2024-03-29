import { promises as fs } from "fs";
import exifr from "exifr";

const imagesDir = "images";

/*
 * Erfasst die Metadaten der Bilder
 * Metadaten: Kamera-Hersteller, Kamera-Modell, Brennweiten, ISO-Werte, Anzahl der Bilder gruppiert nach Brennweiten
 */
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
        const cameraModel =
          `${make}${lensModel ? ` - ${lensModel}` : ` - ${model}`}` ||
          "Unbekannt";
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
      } else {
        cameraInfo["Unbekannt"] = {
          imagecount: files.length,
        };
      }
    }
    return cameraInfo;
  } catch (err) {
    console.error("Fehler:", err);
  }
}
