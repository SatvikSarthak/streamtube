import { Router } from "express";

const router = Router();
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

router
  .route("/toggleSubscription/:channelId")
  .post(verifyJWT, toggleSubscription);
router
  .route("/getUserChannelSubscribers/:channelId")
  .get(verifyJWT, getUserChannelSubscribers);
router
  .route("/getMySubcribedChannel/:channelId")
  .get(verifyJWT, getSubscribedChannels);

export default router;
