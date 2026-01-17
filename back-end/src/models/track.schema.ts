import type { Document } from "mongoose";
import mongoose from "mongoose";

export enum BeatType {
  kit = "kit",
  single = "single",
  album = "album",
}

export enum LicenseType {
  basic = "basic",
  premium = "premium",
}

export enum StatusType {
  active = "active",
  inactive = "inactive",
}

export interface FileUrlInterface {
  tagged: string;
  untagged: string;
}

export interface LicenseInterface {
  basic: string;
  premium: string;
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
  license: LicenseInterface;
  tags: string[];
  basicPrice: number;
  premiumPrice: number;
  genre: string;
  fileUrl: FileUrlInterface;
  relatedTrack: string[];

  // methods
  removeUnwantedFields(): TrackInterface;
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
      default: StatusType.active,
    },
    bpm: {
      type: Number,
      required: true,
    },
    license: {
      basic: { type: String, required: true },
      premium: { type: String, required: true },
    },
    tags: [String],
    genre: {
      type: String,
      required: true,
    },
    fileUrl: {
      tagged: {
        type: String,
        required: true,
      },
      untagged: {
        type: String,
        required: true,
      },
    },
    relatedTrack: [{ type: mongoose.Types.ObjectId, ref: "Track" }],
  },
  { timestamps: true }
);

trackSchema.methods.removeUnwantedFields = function (): TrackInterface {
  const obj = this.toObject();
  delete obj.fileUrl;
  delete obj.license;
  delete obj.coverImagePath;
  return obj;
};

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
