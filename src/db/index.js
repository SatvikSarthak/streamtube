import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
  const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
  console.log(`\n MONGO DB CONNECTION HOST IS ${connectionInstance.connection}`);
  console.log(connectionInstance.connection)
    
  } catch (error) {
    console.error("error", error);
   // throw error;
   process.exit(1);
}
};

export default connectDB;