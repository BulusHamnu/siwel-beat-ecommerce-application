import mongoose, { Schema, model, Document, type ObjectId } from "mongoose";

export interface FileUrl extends Document {
  trackId: ObjectId;
  tagged: string;
  untagged: string;
}

/* FileUrl schema */
const fileUrlSchema = new Schema<FileUrl>({
  trackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Track",
    required: true,
  },
  tagged: { type: String, required: true },
  untagged: { type: String, required: true },
});

const FileUrl = model<FileUrl>("FileUrl", fileUrlSchema);
export default FileUrl;
