import type { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";

export interface FavouriteInterface extends Document {
  userId: ObjectId;
  trackId: ObjectId;
}

const favourite = new mongoose.Schema<FavouriteInterface>(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "User",
    },
    trackId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "Track",
    },
  },
  { timestamps: true }
);

const Favourite = mongoose.model<FavouriteInterface>("Favourite", favourite);
export default Favourite;
