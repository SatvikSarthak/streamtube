import { Router } from "express";
import {
  loginUser,
  logOutUser,
  registerUser,
  refreshAccessToken,
  getUserDetails,
  updateUserAvatar,
  deleteCoverAsset,
  updateUserCoverImage,
  updateUserDetails,
  getUserChannelDetails,
  getWatchHistory,
  changeCurrentPassword
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import path from "path";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);

//secured routes , loggedIn user
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/getUser").get(verifyJWT, getUserDetails);
router
  .route("/avatar-change")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("cover-change")
  .patch(verifyJWT, upload.single("cover"), updateUserCoverImage);
router.route("/update").patch(verifyJWT, updateUserDetails);

router.route("/delete-cover").delete(verifyJWT, deleteCoverAsset);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/c/:username").get(verifyJWT, getUserChannelDetails);
router.route("/history").get(verifyJWT,getWatchHistory)
export default router;
