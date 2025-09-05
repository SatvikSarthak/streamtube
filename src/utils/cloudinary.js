import { v2 as cloudinary } from "cloudinary";
import fs, { rmSync } from "fs";
import { ApiError } from "./ApiError.js";

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
    fs.unlinkSync(localFilePath);
    console.log(response);
    return response;
  } catch (error) {
    //upload unsuccessfull
    // delete the file
    fs.unlinkSync(localFilePath);
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
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { uploadOnCloudinary, deleteOnCloudinary };
