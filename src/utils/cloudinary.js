import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "./ApiError.js";
import streamifier from "streamifier";
import { fileTypeFromBuffer } from "file-type";

// const uploadOnCloudinary = async (localFilePath) => {
//   try {
//     //if local file doesnt exists
//     if (!localFilePath) return null;
//     // upload on cloudinary
//     const response = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: "auto",
//     });
//     // file uploaded , gives back an resposne object with several fields including url

//     // console.log("file upload successfully", response);
//     // return the response to user
//     if (fs.existsSync(localFilePath)) {
//       fs.unlinkSync(localFilePath);
//     }

//     console.log(response);
//     return response;
//   } catch (error) {
//     //upload unsuccessfull
//     // delete the file
//     if (fs.existsSync(localFilePath)) {
//       fs.unlinkSync(localFilePath);
//     }

//     return null;
//   }
// };

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

const uploadOnCloudinary = async (fileBuffer) => {
  try {
    if (!fileBuffer) return null;
    const detectType = await fileTypeFromBuffer(fileBuffer);
    console.log(detectType);
    const fileCategory = detectType?.mime.split("/")[0];
    if (!(fileCategory == "video" || fileCategory == "image")) {
      throw new ApiError(400, "file must be image or video");
      return res.status(404);
    }
    console.log(fileCategory);
    const resposne = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: fileCategory === "video" ? "video" : "images",
        },
        (error, result) => {
          if (error) {
            reject(
              new ApiError(500, error?.message || "File could not be uploaded")
            );
          } else {
            console.log(result);
            resolve(result);
          }
        }
      );
      console.log("here ");
      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
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

export { uploadOnCloudinary, deleteOnCloudinary };
