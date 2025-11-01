import type { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";

export interface Favourite extends Document {
  userId: ObjectId;
  trackId: ObjectId;
}

const favourite = new mongoose.Schema<Favourite>(
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

const Favourite = mongoose.model<Favourite>("Favourite", favourite);
