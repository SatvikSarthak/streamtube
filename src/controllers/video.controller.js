import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { upload } from "../middlewares/multer.middleware.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };
  const ownerId = new mongoose.Types.ObjectId(userId);
  // query on which to sort by
  //sort by - created at , views etc ,
  // sort type asc or desc. , 1-> asc, -1=> desc

  //console.log(id);
console.log("query:", query);
console.log("sortBy:", sortBy);
console.log("sortType:", sortType);
console.log("userId:", userId, "converted:", ownerId);

  const pipeline =  Video.aggregate([
    {
      $match: {
        ...(query && {
          $or: [
            {
              title: { $regex: query, $options: "i" },
            },
            { description: { $regex: query, $options: "i" } },
          ],
        }),
        ...(userId && { owner: ownerId }),
      },
    },

    {
      $lookup: {
        localField: "owner",
        foreignField: "_id",
        from: "users",
        as: "creator",
      },
    },
    { $unwind: "$creator" },

    {
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    },
    {
      $project: {
        isPublished: 1,
        title: 1,
        username:"$creator.username",
      },
    },
  ]);
  console.log(pipeline);

  const result = await Video.aggregatePaginate(pipeline, options);
 if (!result || result.docs.length === 0) throw new ApiError(404, "No videos found");


  return res
    .status(200)
    .json(new ApiResponse(200, result, "video fetched succesfully"));
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

  const videoDetails = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "owner",
        as: "ownerDetails",
      },
    },
    //break the owner details into single array
    { $unwind: "$ownerDetails" },
    {
      $project: {
        videoFile: 1,
        username: "$ownerDetails.username",
        fullname: "$ownerDetails.fullname",
        duration: 1,
        thumbnail: 1,
        views: 1,
        title: 1,
        description: 1,
      },
    },
  ]);
  if (!videoDetails) throw new ApiError(500, "Error fetching video");

  return res
    .status(200)
    .json(new ApiResponse(200, videoDetails, "Video Fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;
  if (!title || !description) {
    throw new ApiError(400, "both title and description is required");
  }
  console.log(req.file);
  let thumbnailBuffer;
  if (
    req.file &&
    Array.isArray(req.file.thumbnail) &&
    req.file.thumbnail.length > 0
  ) {
    thumbnailBuffer = req.file.thumbnail.buffer;
  }
  let newThumbnailDetails;
  console.log(thumbnailBuffer);
  if (thumbnailBuffer) {
    newThumbnailDetails = await uploadOnCloudinary(thumbnailBuffer);
  }
  console.log(newThumbnailDetails);
  const video = await Video.findById(videoId);
  console.log(video.thumbnail_publicId);
  if (newThumbnailDetails) {
    await deleteOnCloudinary(video.thumbnail_publicId);
  }
  //console.log(deleteResponse);
  video.title = title;
  video.description = description;
  if (newThumbnailDetails) {
    video.thumbnail = newThumbnailDetails?.url;
    video.thumbnail_publicId = newThumbnailDetails?.public_id;
  }
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  const validVideoId = mongoose.isValidObjectId(videoId);
  if (!validVideoId) throw new ApiError(400, "Video does not exists");

  const videoDetails = await Video.findById(videoId);
  if (!(req.user?.id.toString() === videoDetails.owner.toString())) {
    throw new ApiError(400, "Unauthorized to delete this video");
  }
  const response = await videoDetails.deleteOne();
  console.log(response);
  if (!response.acknowledged)
    throw new ApiError(500, "Video couldnt be deleted");

  return res
    .status(200)
    .json(
      new ApiResponse(200, response.acknowledged, "video deleted successfully")
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId || !mongoose.isValidObjectId(videoId))
    throw new ApiError(400, "Please provide a valid video id");

  const videoDetails = await Video.findByIdAndUpdate(videoId);
  if (!videoDetails) throw new ApiError(500, "Error ");
  videoDetails.isPublished = !videoDetails.isPublished;
  await videoDetails.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, videoDetails, "done"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
