import { Router } from "express";
import { createPlaylist, getUserPlaylists } from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/createPlaylist").post(verifyJWT, createPlaylist);
router.route("/getUserPlaylists/:userId").get(verifyJWT,getUserPlaylists);
export default router;
