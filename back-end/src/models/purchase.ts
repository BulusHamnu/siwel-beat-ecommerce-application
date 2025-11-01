import type { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";

export interface Purchase extends Document {
  userId: ObjectId;
  trackId: ObjectId;
}

const purchase = new mongoose.Schema<Purchase>(
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

const Purchase = mongoose.model<Purchase>("Purchase", purchase);
