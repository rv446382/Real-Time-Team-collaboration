import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connected Successfully!!");
  } catch (error) {
    console.error("Database Connection Failed!!");
    console.error(error);
    process.exit(1);
  }
};