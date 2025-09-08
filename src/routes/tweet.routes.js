import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";
const router = Router();

router.route("/new-tweet").post(verifyJWT, createTweet);
router.route("/get-tweets").get(verifyJWT, getUserTweets);
router.route("/delete/:tweetId").delete(verifyJWT, deleteTweet);
router.route("/update-tweet/:tweetId").patch(verifyJWT, updateTweet);

export default router;
