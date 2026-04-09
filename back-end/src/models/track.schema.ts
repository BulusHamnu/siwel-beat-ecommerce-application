import type { Document } from "mongoose";
import mongoose from "mongoose";

export enum BeatType {
  kit = "kit",
  single = "single",
  album = "album",
}

export enum StatusType {
  published = "published",
  unpublish = "unpublished",
}

export interface TrackInterface extends Document {
  coverImageUrl: string;
  coverImagePath: string;
  title: string;
  description: string;
  type: BeatType;
  key: string;
  status: StatusType;
  bpm: number;
  tags: string[];
  basicPrice: number;
  premiumPrice: number;
  genre: string;
  relatedTrack: string[];
  createdAt: Date;
  updatedAt: Date;
}

const trackSchema = new mongoose.Schema<TrackInterface>(
  {
    coverImageUrl: {
      type: String,
      required: true,
    },
    coverImagePath: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    basicPrice: {
      type: Number,
      required: true,
    },
    premiumPrice: {
      type: Number,
      required: true,
    },
    description: String,
    type: {
      type: String,
      enum: Object.values(BeatType),
      default: BeatType.single,
    },
    key: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(StatusType),
      default: StatusType.published,
    },
    bpm: {
      type: Number,
      required: true,
    },
    tags: [String],
    genre: {
      type: String,
      required: true,
    },
    relatedTrack: [{ type: mongoose.Types.ObjectId, ref: "Track" }],
  },
  { timestamps: true },
);

/* Indexes */
trackSchema.index({
  title: "text",
  description: "text",
  tags: "text",
  genre: "text",
});

trackSchema.index({ status: 1, createdAt: -1 });
trackSchema.index({ status: 1, genre: 1, createdAt: -1 });
trackSchema.index({ status: 1, type: 1, createdAt: -1 });

const Track = mongoose.model<TrackInterface>("Track", trackSchema);
export default Track;
