import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
import { upload } from "../middlewares/multer.middleware.js";
import { publishAVideo } from "../controllers/video.controller.js";
router.route("/upload").post(verifyJWT, upload.single("video"), publishAVideo);

export default router;
