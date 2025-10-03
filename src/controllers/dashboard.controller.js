import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const user = new mongoose.Types.ObjectId(req.user?._id);

  const videos = await Video.aggregate([
    {
      $match: {
        owner: user,
      },
    },
    {
      $lookup: {
        from: "users",
        as: "userDetails",
        localField: "owner",
        foreignField: "_id",
      },
    },
    {
      $unwind: "$userDetails",
    },
    {
      $project: {
        username: "$userDetails.username",
        title: 1,
        description: 1,
      },
    },
  ]);
  if(!videos){
    return res.status(200).json(new ApiResponse(200,videos,"no videos"))
  }else{
    return res.status(200).json(new ApiResponse(200,videos,"fetched"))
  }
});

export { getChannelStats, getChannelVideos };
