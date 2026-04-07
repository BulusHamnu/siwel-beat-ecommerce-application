import type { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";

export interface Favourite extends Document {
  userId: ObjectId;
  trackId: ObjectId;
}

const favourite = new mongoose.Schema<Favourite>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    trackId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Track",
    },
  },
  { timestamps: true },
);

/* Indexes */
favourite.index({ userId: 1 });
favourite.index({ userId: 1, trackId: 1 }, { unique: true });

const Favourite = mongoose.model<Favourite>("Favourite", favourite);
export default Favourite;
