import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  console.log(req.user._id.toString());
  // TODO: toggle subscription
  if (!isValidObjectId(channelId)) throw new ApiError(400, "Enter a valid id");

  const subscribedAlready = Subscription.where({
    channel: channelId,
    subscriber: req.user._id,
  });
  // const alreadySubscibed = await Subscription.findOne({
  //   channel: channelId,
  //   subscriber: req.user?._id.toString(),
  // });
  const alreadySubscibed = await subscribedAlready.find();

  console.log(alreadySubscibed);
  let message;
  if (alreadySubscibed) {
    const deletedSubscription = await Subscription.findOneAndDelete({
      channel: channelId,
      subscriber: req.user._id.toString(),
    });
    message = "Unsubscribed";

    return res
      .status(200)
      .json(new ApiResponse(200, deletedSubscription, message));
  } else {
    const newSubsriber = await Subscription.create({
      channel: channelId,
      subscriber: req.user?._id,
    });
    message = "Subscribed";
    console.log("we came here");
    return res.status(201).json(new ApiResponse(200, newSubsriber, message));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) throw new ApiError(400, "enter a vilid id");

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberDetails",
      },
    },
    {
      $group: {
        _id: "$channel",
        subscribers: { $push: "$subscriberDetails.username" },
        numberofSubscriber: { $sum: 1 },
      },
    },
  ]);

  if (subscribers.length == 0)
    return res
      .status(200)
      .json(new ApiResponse(200, subscribers, " 0 subscribers"));

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  //const { subscriberId } = req.params;

  //if (!isValidObjectId(subscriberId.toString()))
  //throw new ApiResponse(400, "Please give a valid id");

  const subscribedTo = await Subscription.aggregate([
    {
      $match: {
        // subscriber: new mongoose.Types.ObjectId(subscriberId),
        subscriber: req.user._id,
      },
    },
    {
      $lookup: {
        localField: "channel",
        foreignField: "_id",
        from: "users",
        as: "channelDetails",
      },
    },
    {
      $project: {
        subscriber: 1,
        channelDetails: "$channelDetails.username",
        number: { $size: "$channelDetails" },
      },
    },
  ]);

  if (subscribedTo.length == 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscribedTo,
          "You haven't subscribed  anybody yet , you should definitely explore"
        )
      );
  }

  return res.status(200).json(new ApiResponse(200, subscribedTo, "ye lo"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
