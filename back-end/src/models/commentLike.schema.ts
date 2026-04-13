import type { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";

export interface CommentLikeInterface extends Document {
  userId: ObjectId;
  commentId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentLike = new mongoose.Schema<CommentLikeInterface>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Comment",
    },
  },
  { timestamps: true },
);

/* Indexes */
commentLike.index({ userId: 1 });
commentLike.index({ userId: 1, commentId: 1 }, { unique: true });

const CommentLike = mongoose.model<CommentLikeInterface>(
  "CommentLike",
  commentLike,
);
export default CommentLike;
