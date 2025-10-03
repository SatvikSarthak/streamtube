import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!isValidObjectId(videoId))
    throw new ApiError(400, "please provide a valid a video");

  const likeCond = {
    video: new mongoose.Types.ObjectId(videoId),
    likedBy: new mongoose.Types.ObjectId(req.user._id),
  };
  const like = await Like.findOne(likeCond);
  let message = "";

  if (!like) {
    const likeCreated = await Like.create(likeCond);
    console.log(likeCreated);
    message = "Liked Successfully";
    return res.status(200).json(new ApiResponse(200, likeCreated, message));
  } else {
    const deleted = await Like.deleteOne(likeCond);
    message = "Unliked";
    console.log(deleted);
    return res.status(200).json(new ApiResponse(200, deleted, message));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  const commentCond = {
    comment: new mongoose.Types.ObjectId(commentId),
    likedBy: new mongoose.Types.ObjectId(req.user._id),
  };

  const commentLike = await Like.findOne(commentCond);
  let message;
  if (!commentLike) {
    const liked = await Like.create(commentCond);
    message = "Liked successfully";

    if (!liked) throw new ApiError(500, "Server error");

    return res
      .status(200)
      .json(new ApiResponse(200, liked, "Liked created successfully"));
  } else {
    const deleted = await Like.deleteOne(commentCond);
    message = "Comment Disliked";

    if (deleted.deletedCount === false) throw new ApiError(500, "server error");
    return res
      .status(200)
      .json(new ApiResponse(200, deleted, "Disliked  successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const tweetCond = {
    tweet: new mongoose.Types.ObjectId(tweetId),
    likedBy: new mongoose.Types.ObjectId(req.user._id),
  };

  const tweetLikedOrNot = await Like.findOne(tweetCond);
  let message;
  if (!tweetLikedOrNot) {
    const liked = await Like.create(tweetCond);
    message = "Liked";

    if (!liked) throw new ApiError(500, "server errro");
    return res.status(200).json(new ApiResponse(200, liked, message));
  } else {
    const deleted = Like.deleteOne(tweetCond);
    message = "disliked";

    if (deleted.deletedCount === 0) throw new ApiError(500, "Server error");
    return res.status(200).json(new ApiResponse(200, deleted, "dislked"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const userId = new mongoose.Types.ObjectId(req.user?._id);

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: userId,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    { $unwind: "$videoDetails" },
    {
      $project: {
        likedBy: 1,
        videoName: "$videoDetails.title",
        videoUploadDate: "$videoDetails.createdAt",
      },
    },
  ]);
  console.log(likedVideos);

  if (likedVideos === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, likedVideos, "No liked videos"));
  } else {
    return res.status(200).json(new ApiResponse(200, likedVideos, "Fetched"));
  }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
