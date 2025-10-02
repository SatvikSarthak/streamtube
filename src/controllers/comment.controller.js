import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(videoId))
    throw new ApiError(400, "providee a valid video");
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const comments = Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        as: "commentOwner",
        localField: "owner",
        foreignField: "_id",
      },
    },
    {
      $lookup: {
        from: "videos",
        as: "videoDetails",
        localField: "video",
        foreignField: "_id",
      },
    },
    {
      $unwind: "$commentOwner",
    },
    { $unwind: "$videoDetails" },
    {
      $project: {
        videoTitle: "$videoDetails.title",
        videoDescription: "$videoDetails.description",
        content: 1,
        video:1,
        owner:"$commentOwner.username"
      },
    },
  ]);

  const commentDetails = await Comment.aggregatePaginate(comments, options);
  if (!commentDetails || commentDetails.docs.length === 0)
    throw new ApiError(404, "No comments");

  return res.status(200).json(new ApiResponse(200, commentDetails, "fetched"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { content } = req.body;
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "send a actual video");

  // const comment = await Comment.findById({ video: videoId });

  const comment = await Comment.create({
    video: videoId,
    content: content,
    owner: req.user?._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment created successfullt"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;
  if (!isValidObjectId(commentId))
    throw new ApiError(400, "Please provide a valid comment ");

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(400, "Comment doesnt exists");
  if (comment.owner.toString() != req.user?._id.toString())
    throw new ApiError(401, "Unauthorized");

  comment.content = content;
  await comment.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  if (!isValidObjectId(commentId))
    throw new ApiError(400, "Please provide a valid comment id");

  const comment = await Comment.findByIdAndDelete(commentId);

  if (!comment) throw new ApiError(400, "Comment doesnt exists");

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
