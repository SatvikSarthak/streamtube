
// import express from "express";
// const app = express();

import connectDB from "./db/index.js";
//require('dotenv').config({path:'./env'});
import 'dotenv/config' 

connectDB();
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
