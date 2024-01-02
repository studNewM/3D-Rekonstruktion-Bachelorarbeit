import { Router } from 'express'
import { start_reconstruction } from '../controller/reconstruction.controller.js';
import { upload_images } from '../controller/image.controller.js'
import { getMetdata } from '../controller/image.controller.js'
import multer from 'multer';
const upload = multer({ dest: 'Tempuploads/' });
const router = Router()


/* POST  Reconstruction Process*/
router.post('/reconstruction', start_reconstruction)

/* POST  Upload Images */
router.post('/upload', upload.array('fileList'), upload_images);

router.get('/metadata', getMetdata)

export default router