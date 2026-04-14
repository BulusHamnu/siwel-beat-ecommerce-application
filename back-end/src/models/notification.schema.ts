import type { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";

export enum NotificationType {
  COMMENT_LIKED = "COMMENT_LIKED",
  COMMENT_REPLIED = "COMMENT_REPLIED",
  TRACK_COMMENTED = "TRACK_COMMENTED",

  MESSAGE_RECEIVED = "MESSAGE_RECEIVED",
  NEWSLETTER_SUBSCRIBED = "NEWSLETTER_SUBSCRIBED",
}

export interface notification extends Document {
  userId: ObjectId;
  date: Date;
  message: string;
  read: boolean;
  type: string;
  resourceId: ObjectId;
  entityId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
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
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    resourceId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    entityId: {
      type: mongoose.Schema.ObjectId,
      // required: true,
      default: null,
    },
  },
  { timestamps: true },
);

/* Indexes */
notification.index({ userId: 1, read: 1, date: -1 });
// notification.index({ userId: 1, resourceId: 1, entityId: 1 });

const Notification = mongoose.model<notification>("Notification", notification);
export default Notification;
