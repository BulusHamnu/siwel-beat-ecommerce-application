import type { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";

export interface Comment extends Document {
  trackId: string | ObjectId;
  content: string;
  userId: string | ObjectId;
  parentId: null | ObjectId;
}

const comment = new mongoose.Schema<Comment>(
  {
    trackId: {
      type: mongoose.Schema.ObjectId,
      ref: "Track",
      required: true,
    },
    content: { type: String, required: true },
    userId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "User",
    },
    parentId: {
      type: mongoose.Schema.ObjectId,
      default: null,
      ref: "Comment",
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model<Comment>("Comment", comment);
