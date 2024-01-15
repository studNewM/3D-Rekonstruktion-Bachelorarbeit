import { promises as fs } from 'fs';
import exifr from 'exifr';

const imagesDir = 'images';

async function processImages() {
    try {
        const files = await fs.readdir(imagesDir);
        const cameraInfo = {};

        for (const file of files) {
            const exifData = await exifr.parse(`${imagesDir}/${file}`);
            if (exifData) {
                const make = exifData.Make || 'Unbekannt';
                const lensModel = exifData.LensModel || '';
                const model = exifData.Model || 'Modell';
                const cameraModel = `${make}${lensModel ? ` - ${lensModel}` : ` - ${model}`}`;

                const focalLength = exifData.FocalLength ? exifData.FocalLength + 'mm' : 'Unbekannt';
                const iso = `ISO ${exifData.ISO || 'Unbekannt'}`;
                const exposureTime = exifData.ExposureTime || 'Unbekannt';
                const fNumber = exifData.FNumber || 'Unbekannt';
                const dateTimeOriginal = exifData.DateTimeOriginal || 'Unbekannt';
                const exposureProgram = exifData.ExposureProgram || 'Unbekannt';
                const meteringMode = exifData.MeteringMode || 'Unbekannt';
                const flash = exifData.Flash || 'Unbekannt';
                const imageResolution = `${exifData.ExifImageWidth || 'Unbekannt'} x ${exifData.ExifImageHeight || 'Unbekannt'}`;

                const orintation = exifData.Orientation || 'Unbekannt';
                const SceneType = exifData.SceneType || 'Unbekannt';


                if (!cameraInfo[cameraModel]) {
                    cameraInfo[cameraModel] = {
                        maker: '', model: '', focalLengths: new Set(), isoValues: new Set(),
                        exposureTimes: new Set(), fNumbers: new Set(),
                        originalDates: new Set(), exposurePrograms: new Set(),
                        meteringModes: new Set(), flashStatuses: new Set(),
                        imageResolutions: new Set(), count: 0
                    };
                }
                cameraInfo[cameraModel].maker = make;
                cameraInfo[cameraModel].model = lensModel ? lensModel : model;
                cameraInfo[cameraModel].focalLengths.add(focalLength);
                cameraInfo[cameraModel].isoValues.add(iso);
                cameraInfo[cameraModel].exposureTimes.add(exposureTime);
                cameraInfo[cameraModel].fNumbers.add(fNumber);
                cameraInfo[cameraModel].originalDates.add(dateTimeOriginal);
                cameraInfo[cameraModel].exposurePrograms.add(exposureProgram);
                cameraInfo[cameraModel].meteringModes.add(meteringMode);
                cameraInfo[cameraModel].flashStatuses.add(flash);
                cameraInfo[cameraModel].imageResolutions.add(imageResolution);
                cameraInfo[cameraModel].orintation = orintation;
                cameraInfo[cameraModel].SceneType = SceneType;
                cameraInfo[cameraModel].count++;
            }
        }
        console.log(cameraInfo);;

    } catch (err) {
        console.error('Fehler:', err);
    }
}

processImages();