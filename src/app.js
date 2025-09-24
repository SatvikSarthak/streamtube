//file for express code

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
//config settings
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// setting limit for amount of json that can be received
app.use(express.json({ limit: "16kb" }));
//now for url, you send data through url, and there are different encodings for it
app.use(express.urlencoded({ limit: "16kb", extended: true }));
//static , used for storing files on server
app.use(express.static("public"));
app.use(cookieParser());

//import routes
import userRoute from "./routes/user.routes.js";
import tweetRoute from "./routes/tweet.routes.js";
import videoRoute from "./routes/video.routes.js";
import subscriptionRoute from "./routes/subscription.routes.js";
// routes declaration
app.use("/api/v1/users", userRoute);
app.use("/api/v1/tweet", tweetRoute);
app.use("/api/v1/video", videoRoute);
app.use("/api/v1/subscription", subscriptionRoute);
export { app };
