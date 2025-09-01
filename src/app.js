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

// routes declaration
app.use("/api/v1/users", userRoute);
// import { ApiError } from "./utils/ApiError.js";
// app.use((err, req, res, next) => {
//   console.error("🔥 Error Middleware Triggered 🔥");
//   console.error("Error Name:", err.name);
//   console.error("Error Message:", err.message);
//   console.error("Stack Trace:", err.stack);

//   if (!(err instanceof ApiError)) {
//     err = new ApiError(500, err.message || "Internal Server Error");
//   }

//   return res.status(err.statusCode).json({
//     success: err.success,
//     message: err.message,
//     errors: err.errors,
//     stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
//   });
// });

export { app };
