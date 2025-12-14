import type { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";

export interface notification extends Document {
  userId: ObjectId;
  date: Date;
  message: string;
  read: boolean;
  type: string;
}

const notification = new mongoose.Schema<notification>(
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
    type: String,
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model<notification>("Notification", notification);
export default Notification;
