import type { Document } from "mongoose";
import mongoose from "mongoose";

enum BeatType {
  kit = "kit",
  single = "single",
  album = "album",
}

enum StatusType {
  active = "active",
  inactive = "in-active",
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

export interface createTrackBody {
  title: string;
  description: string;
  type: BeatType;
  key: string;
  bpm: number;
  tags: string[];
  price: number;
  genre: string;
}

const trackSchema = new mongoose.Schema<TrackInterface>(
  {
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
      enum: ["kit", "single", "album"],
    },
    key: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "in-active"],
      // default: "active",
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
    relatedTrack: [String],
  },
  { timestamps: true }
);

trackSchema.methods.removeUnwantedFields = function (): TrackInterface {
  const obj: TrackInterface = this.toObject();
  delete obj.fileUrl;
  delete obj.license;
  return obj;
};

const Track = mongoose.model<TrackInterface>("Track", trackSchema);
export default Track;
