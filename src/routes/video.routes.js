import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
import { upload } from "../middlewares/multer.middleware.js";
import {
  publishAVideo,
  getVideoById,
  deleteVideo,
  updateVideo,
  togglePublishStatus,
} from "../controllers/video.controller.js";
router.route("/upload").post(
  verifyJWT,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishAVideo
);

router.route("/get-video/:videoId").get(verifyJWT, getVideoById);
router.route("/delete/:videoId").delete(verifyJWT, deleteVideo);
router
  .route("/update/:videoId")
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

router.route("/toggle-publish/:videoId").post(verifyJWT, togglePublishStatus);
export default router;
