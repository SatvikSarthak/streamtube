import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if ([title, description].some((field) => field.trim() === "")) {
    throw new ApiError(400, "Title or Description is required");
  }

  const videoBuffer = req.files?.video?.[0].buffer;
  //console.log(videoBuffer);
  if (!videoBuffer) throw new ApiError(400, "Video is required");

  const thumbnailBuffer = req.files?.thumbnail?.[0].buffer;
  if (!thumbnailBuffer) throw new ApiError(400, "thumbnail is required");
  //console.log(thumbnailBuffer);

  const videoUpload = await uploadOnCloudinary(videoBuffer);
  //  console.log("video upload",videoUpload);
  const thumbailUpload = await uploadOnCloudinary(thumbnailBuffer);
  if (!videoUpload && !thumbailUpload)
    throw new ApiError(500, "Video and thumbnail couldn't be uploaded");
  //console.log("thumbnail upload",thumbailUpload);

  const newVideo = await Video.create({
    videoFile: videoUpload?.url,
    video_publicId: videoUpload?.public_id,
    thumbnail: thumbailUpload?.url,
    thumbnail_publicId: thumbailUpload?.public_id,
    owner: req.user?._id,
    title,
    description,
    duration: videoUpload?.duration,
  });
  //console.log(newVideo);

  if (!newVideo) throw new ApiError(500, "Video couldnt be created");
  return res
    .status(200)
    .json(new ApiResponse(200, { newVideo }, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  const validVideoId = mongoose.isValidObjectId(videoId);
  if (!validVideoId) throw new ApiError(400, "Please provide a valid video");
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
