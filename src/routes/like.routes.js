import Router from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos,
} from "../controllers/like.controller.js";
const router = Router();

router.route("/togglelike/:videoId").post(verifyJWT, toggleVideoLike);
router
  .route("/toggleCommentLike/:commentId")
  .post(verifyJWT, toggleCommentLike);
router.route("/toggleTweetLike/:tweetId").post(verifyJWT, toggleTweetLike);

router.route("/getLikedVideos").get(verifyJWT, getLikedVideos);
export default router;
