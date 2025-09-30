import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  //TODO: create playlist
  const { name, description } = req.body;
  if ([name, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Name and description is necessary");
    console.log(name, description);
  }

  const newPlaylist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });
  if (!newPlaylist) throw new ApiError(500, "server error");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        newPlaylist,
        `playlist create successfully ${req.user.username}`
      )
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!isValidObjectId(userId)) throw new ApiError();

  const playlistDetails = Playlist.where({
    owner: userId,
  });

  // console.log(playlistDetails);
  const playlist = await playlistDetails.find();
  console.log(playlist);
  if (playlist.length === 0) throw new ApiError(400, "Playlist doesnt exist");
  return res.status(200).json(new ApiResponse(200, playlist, "fetched"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Please provide a valid object id");

  const playlistDetails = Playlist.where({ _id: playlistId });

  const playlist = await playlistDetails.findOne();

  if (!playlist) throw new ApiError(400, "Playlist doesnt exist");

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId))
    throw new ApiError(400, "please provide a valid id For playlist and video");

  const playlist = await Playlist.findById(playlistId);
  console.log(playlist);
  // if (playlist.length === null)
  //   throw new ApiError(400, "Playlist doesn't exist");
  // wrong because it returns a object or null
  if (!playlist) throw new ApiError(400, "Playlist doesn't exist");

  // this is wrong because we have to. match the string here
  // if (playlist.owner != new mongoose.Types.ObjectId(req.user._id))
  //   throw new ApiError(400, "Unauthorized request");

  if (playlist.owner.toString() != req.user._id.toString())
    throw new ApiError(403, "Unauthorized request");
  // playlist.video = [...playlist.video, videoId];
  // we shoudl not spread because it creates an eniterly new array which is an O(n) operation

  if (playlist.video.includes(videoId))
    throw new ApiError(400, "Video already exists");
  playlist.video.push(videoId);

  await playlist.save({ validateBeforeSave: false });

  const playlist2 = await Playlist.findById(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, playlist2, "Video added successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId))
    throw new ApiError(400, "Playlist and video is required");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(400, "Playlist doesn't exists");
  console.log(playlist.video);
  if (playlist.video.includes(videoId)) {
    playlist.video.pull(videoId);
    console.log(playlist.video);
    await playlist.save();

    return res.json(
      new ApiResponse(200, playlist, "Video removed successfully")
    );
  } else {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "video id doesnt exists"));
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Please provide a valid playlist");
  const playlistDetails = await Playlist.findById(playlistId);

  if (!playlistDetails) {
    return res
      .status(200)
      .json(new ApiResponse(200, playlistDetails, "playlist doesnt exists"));
  } else if (playlistDetails.owner.toString() === req.user._id.toString()) {
    await playlistDetails.deleteOne();
    return res
      .status(200)
      .json(
        new ApiResponse(200, playlistDetails, "Playlist deleted successfully")
      );
  } else {
    return res.status(400).json(new ApiResponse(400, {}, " Unauthorized"));
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Please provide a valid playlist");

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) throw new ApiError(400, "Playlist doesnt exists");
  else if (playlist.owner.toString() === req.user._id.toString()) {
    playlist.name = name;
    playlist.description = description;
    await playlist.save();
    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Playlist updated succesfully"));
  } else {
    return res.status(400).json(new ApiResponse(400, {}, " Unauthorized"));
  }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
