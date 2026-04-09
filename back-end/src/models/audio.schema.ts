import mongoose, { Schema, model, Document, type ObjectId } from "mongoose";

export interface AudioInterface extends Document {
  trackId: ObjectId;
  tagged: string;
  untagged: string;
  createdAt: Date;
  updatedAt: Date;
}

/* audioSchema */
const audioSchema = new Schema<AudioInterface>(
  {
    trackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Track",
      unique: true,
      required: true,
    },
    tagged: { type: String, required: true },
    untagged: { type: String, required: true },
  },
  { timestamps: true },
);

const Audio = model<AudioInterface>("Audio", audioSchema);
export default Audio;
