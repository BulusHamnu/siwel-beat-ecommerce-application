import mongoose, { Schema, model, Document, type ObjectId } from "mongoose";

export interface Audio extends Document {
  trackId: ObjectId;
  tagged: string;
  untagged: string;
  createdAt: Date;
  updatedAt: Date;
}

/* audioSchema */
const audioSchema = new Schema<Audio>(
  {
    trackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Track",
      required: true,
    },
    tagged: { type: String, required: true },
    untagged: { type: String, required: true },
  },
  { timestamps: true },
);

const Audio = model<Audio>("Audio", audioSchema);
export default Audio;
