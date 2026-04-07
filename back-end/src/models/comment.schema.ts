import type { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";

export interface CommentInterface extends Document {
  trackId: ObjectId;
  likes: number;
  content: string;
  userId: ObjectId;
  parentId: null | ObjectId;
}

const comment = new mongoose.Schema<CommentInterface>(
  {
    trackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Track",
      required: true,
    },
    likes: { type: Number, default: 0 },
    content: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "Comment",
    },
  },
  { timestamps: true },
);

/* Indexes */
comment.index({ trackId: 1 });
comment.index({ trackId: 1, userId: 1 });
comment.index({ trackId: 1, parentId: 1 });

const Comment = mongoose.model<CommentInterface>("Comment", comment);

export default Comment;
