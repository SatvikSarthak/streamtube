import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;

  if (!content.trim() === "") {
    throw new ApiError(400, "Tweet is empty");
  }

  const tweet = await Tweet.create({
    owner: req.user?.id,
    content,
  });

  if (!tweet) throw new ApiError(500, "There was an error creating the tweet");

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets

  //   const allTweets = await Tweet.find({ owner: req.user?.id });
  // using aggregation pipeline to get username also

  const allTweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?.id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "tweetDetails",
      },
    },
    // unwind breaks into single arrays
    { $unwind: "$tweetDetails" },
    {
      $project: {
        username: "$tweetDetails.username",
        fullname: "$tweetDetails.fullname",
        createdAt: 1,
        content: 1,
        updatedAt: 1,
      },
    },
  ]);
  if (!allTweets) throw new ApiError(400, "tweets could not be retrieved");

  return res
    .status(200)
    .json(new ApiResponse(200, allTweets, "Tweets retrieved successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;
  if (!content.trim() === "") throw new ApiError(400, "empty tweet");
  if (!tweetId) throw new ApiError(400, "send tweetid through url");

  const isTweetValid = mongoose.Types.ObjectId.isValid(tweetId);
  console.log(isTweetValid);
  if (!isTweetValid) throw new ApiError(400, "Tweet does not exist");

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: content,
      },
    },
    { new: true }
  );
  if (!updateTweet) throw new ApiError(500, "Server error while updating");
  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweeet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  if (!tweetId) throw new ApiError(400, "send tweetid through url");
  const validTweetId = mongoose.Types.ObjectId.isValid(tweetId);
  if (!validTweetId) throw new ApiError(400, "Tweet does not exist");

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
  console.log(deletedTweet);
  if (!deletedTweet) throw new ApiError(500, "server error ");
  return res
    .status(200)
    .json(new ApiResponse(200, "tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
