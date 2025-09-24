import mongoose from "mongoose";
import { User } from "./user.model.js";

const subscriptionSchema = new mongoose.Schema(
  {
    subscriber: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required:true
      },
    ],
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required:true
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
