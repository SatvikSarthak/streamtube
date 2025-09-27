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
  if(playlist.length === 0) throw new ApiError(400,"Playlist doesnt exist")
  return res.status(200).json(new ApiResponse(200, playlist, "fetched"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
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
