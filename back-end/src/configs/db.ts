import env from "./env.js";
import mongoose from "mongoose";
import logger from "../utils/logger.js";
// connect to mongoDb
const connectDb = async (): Promise<void> => {
  try {
    mongoose.set("autoIndex", true); // set to false after deployment
    await mongoose.connect(env.MONGO_URI);
    logger.info("Db connected succesfully!");
  } catch (error) {
    logger.error("An error occured while connecting to database.", error);
    process.exit(1);
  }
};

export default connectDb;
