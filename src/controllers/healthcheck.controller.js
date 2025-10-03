import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  //TODO: build a healthcheck response that simply returns the OK status as json with a message

  const user = req.user?._id;

  if (user) {
    return res.status(200).json(new ApiResponse(200, {}, "Everythings Good"));
  } else {
    throw new ApiError(400, "Something's not good");
  }
});

export { healthcheck };
