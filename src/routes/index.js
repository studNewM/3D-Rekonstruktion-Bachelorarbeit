import { Router } from "express";
import { startReconstruction } from "../controller/reconstruction.js";
import { uploadImages, deleteImages } from "../controller/image.js";
import { getMetdata } from "../controller/image.js";
import { getModelPath } from "../controller/model.js";
import multer from "multer";
const upload = multer({ dest: "Tempuploads/" });
const router = Router();

/* POST  Reconstruction Process*/
router.post("/reconstruction", startReconstruction);

/* POST  Upload Images */
router.post("/upload", upload.array("fileList"), uploadImages);
router.post("/delete", deleteImages);

router.get("/metadata", getMetdata);

router.get("/modelPath", getModelPath);
export default router;
