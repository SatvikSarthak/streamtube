import { v2 as cloudinary } from "cloudinary";
import fs, { rmSync } from "fs";
import { ApiError } from "./ApiError.js";

import streamifier from "streamifier";

const uploadOnCloudinary = async (localFilePath) => {
  try {
    //if local file doesnt exists
    if (!localFilePath) return null;
    // upload on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file uploaded , gives back an resposne object with several fields including url

    // console.log("file upload successfully", response);
    // return the response to user
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    console.log(response);
    return response;
  } catch (error) {
    //upload unsuccessfull
    // delete the file
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

const deleteOnCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      return null;
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    console.log(result);
    return result;
  } catch (error) {
    throw new ApiError(
      402,
      error?.message || "Something went wrong while deleting the asset"
    );
  }
};

const uploadVideoOnCloudinary = async (videoBuffer) => {
  try {
    if (videoBuffer) return null;
    const resposne = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          chunk_size: 6 * 1024 * 1024,
          folder: "videos",
        },
        (error, result) => {
          if (error) {
            reject(
              new ApiError(500, error?.message || "File could not be uploaded")
            );
          } else {
            resolve(result);
          }
        }
      );
      streamifier.createReadStream(videoBuffer).pipe(uploadStream);
    });
    return resposne;
  } catch (error) {
    console.error("Cloudinary Video Upload Error:", error);
    throw new ApiError(400, error?.message || "file couldnt be uploaded");
  }
};
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { uploadOnCloudinary, deleteOnCloudinary, uploadVideoOnCloudinary };
