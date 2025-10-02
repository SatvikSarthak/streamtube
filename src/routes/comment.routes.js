import { Router } from "express";

const router = Router();

import {
  addComment,
  updateComment,
  deleteComment,
  getVideoComments,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
router.route("/getVideoComment/:videoId").get(verifyJWT, getVideoComments);
router.route("/addComment/:videoId").post(verifyJWT, addComment);
router.route("/updateComment/:commentId").patch(verifyJWT, updateComment);
router.route("/removeComment/:commentId").delete(verifyJWT, deleteComment);

export default router;
