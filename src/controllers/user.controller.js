import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // now save user's refresh token to database;
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //console.log("Entered registerUser Controller");
  //  console.log("Request Body:", req.body);
  // console.log("Request Files:", req.files);

  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const { fullname, email, username, password } = req.body;
  //console.log("email: ", email);

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  console.log(",,,");

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    avatar_publicId: avatar.public_id,
    coverImage: coverImage?.url || "",
    coverImage_publicId: coverImage?.public_id || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  /*steps->
   1) get user details from body
   2) validate the input details provided
   3) check whether user exists in database
   4) check password
   4) if yes then send refersh and access token using cookies

   also if refresh token exists then directly login

  */
  //  console.log(req.body);
  const { email, password } = req.body;
  if (!email) {
    throw new ApiError(404, "email is required");
  }
  if ([email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(402, "Enter correct email and password");
  }
  const existUser = await User.findOne({ email });
  if (!existUser) throw new ApiError(402, "User doesnt Exists");
  // now for comparing password we had created a method in model which compares the password
  const isPasswordValid = await existUser.kyaPasswordCorrectHai(password);
  if (!isPasswordValid) throw new ApiError(401, "password is invalid");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    existUser._id
  );
  // redundant DB call
  //const loggedInUser = await User.findById(existUser._id).select(
  //   "-password -refreshToken"
  // );
  // instead
  const loggedInUser = existUser.toObject();
  delete loggedInUser.password;
  delete loggedInUser.refreshToken;
  console.log(loggedInUser);
  //or
  //const {password:_, refreshToken:__,...loggedInUser} = existUser.toObject();
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          refreshToken,
          accessToken,
        },
        "user logged In"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  //now ye middleware ke through jayega to iske pas ek req.user rhega
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(201)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  /*steps
  1) user will send refresh token it has.
  2) verify the refresh token with what is saved in database
  3) if verified then give again access token
  
  */
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) throw new ApiError(400, "Unauthorized");
  try {
    const decodedTokenInfo = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedTokenInfo?._id).select(
      "-password "
    );
    if (!user) throw new ApiError("Invalid refresh token");

    if (incomingRefreshToken !== user.refreshToken)
      throw new ApiError(400, "Refresh token is expired or used");

    //generating new token
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user, accessToken, newRefreshToken },
          "New Access and refresh token granted succesfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  /*steps->
  1) user is logged in so get user details from middleware verify jwt 
  2) you have user object in middleware
  3)get old and new password from user
  4) compare old password given and saved
  5) find user with same id and update password 
  6) return if password change is successfull
  */

  const { oldPassword, newPassword } = req.body;

  const userDetails = await User.findById(req.user?._id);

  const isOldPasswordValid =
    await userDetails.kyaPasswordCorrectHai(oldPassword);
  if (!isOldPasswordValid) throw new ApiError(400, "Old password is wrong");

  userDetails.password = newPassword;
  await userDetails.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { userDetails }, "password chnged successfully")
    );
});

const getUserDetails = asyncHandler(async (req, res) => {
  const userDetails = req.user;

  return res
    .status(200)
    .json(
      new ApiResponse(200, { userDetails }, "Details fetched successfully")
    );
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { fullname, username } = req.body;

  if (!username || !fullname) {
    throw new ApiError(402, "atleast one field should be updated");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { fullname, username: username } },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "user details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  /*
  1) 2 middleware lagenge ek multer aur ek verify jwt wala
  2) take localImage path
  3)uploadon cloudinary and get link
  4) update the link in user's database
  */

  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) throw new ApiError(404, "file could not be uploaded");
  const newAvatar = await uploadOnCloudinary(avatarLocalPath);
  if (!newAvatar.url) {
    throw new ApiError(404, "Error while uploading on cloudinary");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: newAvatar.url,
        avatar_publicId: newAvatar.public_id,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Image updated successuclly"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverLocalPath = req.file?.path;
  if (!coverLocalPath) throw new ApiError(404, "file could not be uploaded");
  const newCover = await uploadOnCloudinary(coverLocalPath);
  if (!newCover.url) {
    throw new ApiError(404, "Error while uploading on cloudinary");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: newCover.url,
        coverImage_publicId: newCover.public_id,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "cover Image updated successuclly"));
});
const deleteCoverAsset = asyncHandler(async (req, res) => {
  /*
   1) fetch public Id of the asset from req.user
   2)use delete from cloudinary method and delete the assest;
   3) update in DB
   4) return succesfull response;
  */
  const coverImage_publicId = req.user?.coverImage_publicId;
  if (!coverImage_publicId) throw new ApiError(401, "Unauthorized");

  const deleteResponse = await deleteOnCloudinary(coverImage_publicId);
  if (!deleteResponse)
    throw new ApiError(400, "there was an error while deleting the image");

  const user = await User.findByIdAndUpdate(
    req.user?.id,
    {
      $set: {
        coverImage_publicId: "",
        coverImage: "",
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(201)
    .json(
      new ApiResponse(200, { deleteResponse, user }, "deleted successfully")
    );
});

const getUserChannelDetails = asyncHandler(async (req, res) => {
  /*steps
  1) url se username loge channel ka params ke through
  2)fir aggregation pipeline lagaoge to search for this user in user document
  3)fir usme subscriber ka count daaloge
  4) subscribed to count laoge
  5) fir iss user object mei addfield krke dal doge
  */

  console.log("control reached here");

  const { username } = req.params;
  if (!username?.trim()) throw new ApiError(400, "Username not provided");

  const channelDetails = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        channelSubscribedTo: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        username: 1,
        fullname: 1,
        coverImage: 1,
        avatar: 1,
        subscriberCount: 1,
        channelSubscribedTo: 1,
        isSubscribed: 1,
        email: 1,
      },
    },
  ]);
  if (!channelDetails.length) {
    throw new ApiError(404, "Username or channel doesnot exists");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, [channelDetails[0],channelDetails], "User channel fetched successfully")
    );
});
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    avatar: 1,
                    username: 1,
                    subscriberCount: 1,
                  },
                },
                {
                  $addFields: {
                    owner: {
                      $first: "$owner",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch History fetched successfully"
      )
    );
});
export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getUserDetails,
  updateUserDetails,
  updateUserAvatar,
  updateUserCoverImage,
  deleteCoverAsset,
  getUserChannelDetails,
  getWatchHistory,
};
