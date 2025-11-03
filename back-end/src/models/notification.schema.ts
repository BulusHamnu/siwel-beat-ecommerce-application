import type { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";

export interface Notification extends Document {
  userId: ObjectId;
  date: Date;
  description: string;
}

const notification = new mongoose.Schema<Notification>(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model<Notification>("Notification", notification);
export default Notification;
