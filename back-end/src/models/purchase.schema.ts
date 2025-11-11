import type { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";

export interface purchase extends Document {
  userId: ObjectId;
  trackId: ObjectId;
  type: string;
}

const purchase = new mongoose.Schema<purchase>(
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
    type: {
      type: String,
      required: true,
      enum: ["basic", "premium"],
    },
  },
  { timestamps: true }
);

const Purchase = mongoose.model<purchase>("Purchase", purchase);
export default Purchase;
