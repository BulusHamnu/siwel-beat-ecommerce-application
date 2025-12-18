import type { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";

export interface notification extends Document {
  userId: ObjectId;
  date: Date;
  message: string;
  read: boolean;
  type: string;
  entityId: ObjectId;
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
    entityId: {
      type: mongoose.Schema.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

/* Indexes */
notification.index({ userId: 1, read: 1 });
notification.index({ userId: 1, entityId: 1 });
notification.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model<notification>("Notification", notification);
export default Notification;
