import { Router } from "express";
import multer from "multer";
import { triggerReconstruction } from "../controller/reconstruction.js";
import { uploadImages, deleteImages } from "../controller/image.js";
import { getMetdata } from "../controller/image.js";
import { getModelPath } from "../controller/model.js";
const upload = multer({ dest: "Tempuploads/" });
const router = Router();

router.post("/reconstruction", triggerReconstruction);
router.post("/upload", upload.array("fileList"), uploadImages);
router.post("/delete", deleteImages);
router.get("/metadata", getMetdata);
router.get("/modelPath", getModelPath);
export default router;
