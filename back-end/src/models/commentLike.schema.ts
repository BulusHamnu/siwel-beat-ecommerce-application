import type { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";

export interface CommentLike extends Document {
  userId: ObjectId;
  trackId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentLike = new mongoose.Schema<CommentLike>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    trackId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "Track",
    },
  },
  { timestamps: true },
);

/* Indexes */
commentLike.index({ userId: 1 });
commentLike.index({ userId: 1, trackId: 1 }, { unique: true });

const CommentLike = mongoose.model<CommentLike>("CommentLike", commentLike);
export default CommentLike;
