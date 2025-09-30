import { Router } from "express";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/createPlaylist").post(verifyJWT, createPlaylist);
router.route("/getUserPlaylists/:userId").get(verifyJWT, getUserPlaylists);
router.route("/getPlaylist/:playlistId").get(verifyJWT, getPlaylistById);
router
  .route("/addVideoToPlaylist/:videoId/:playlistId")
  .post(verifyJWT, addVideoToPlaylist);
router
  .route("/removeVideo/:playlistId/:videoId")
  .post(verifyJWT, removeVideoFromPlaylist);
router.route("/deletePlaylist/:playlistId").delete(verifyJWT, deletePlaylist);
router.route("/updatePlaylist/:playlistId").patch(verifyJWT, updatePlaylist);
export default router;
