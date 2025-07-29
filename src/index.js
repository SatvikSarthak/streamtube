// import express from "express";
// const app = express();

import connectDB from "./db/index.js";
//require('dotenv').config({path:'./env'});
import "dotenv/config";
import { app } from "./app.js";
//approach 2
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("error is", err);
  });

//connect db method is an aysnc fucntion whcih always return a promise

//approach 1 ->>
// function connectDB {};

// connectDB();

// // IIFE
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     //now if you have app in same file which for handling express , you can check express connection
//     app.on("error",(error)=>{
//         console.error("Err:",error);
//         throw error;
//     })
//     // if  express is working fine then listen
//     app.listen(process.env.PORT,()=>{
//         console.log(`${process.env.PORT} is listening `)
//     })

//   } catch (error) {
//     console.error("ERROR:", error);
//     throw error;
//   }
// })();
