import type mongoose from "mongoose";
import type { TrackInterface } from "../models/trackModel.js";
import Track from "../models/trackModel.js";
import type { ObjectId } from "mongoose";

export interface TrackData {
  title: string;
  description: string;
  type: string;
  key: string;
  bpm: number;
  tags: string[];
  price: number;
  genre: string;
  taggedFileUrl: string;
  unTaggedFileUrl: string;
  basicLicenseUrl: string;
  premiumLicenseUrl: string;
}

const createNewTrack = async ({
  title,
  description,
  type,
  key,
  bpm,
  tags,
  price,
  genre,
  taggedFileUrl,
  unTaggedFileUrl,
  basicLicenseUrl,
  premiumLicenseUrl,
}: TrackData): Promise<TrackInterface> => {
  //look for related tracks
  const tracks = await Track.find({ type, genre, tags: { $in: tags } })
    .limit(5)
    .sort({ createdAt: -1 });
  const relatedTrack: ObjectId[] = tracks.map(
    (track): ObjectId => track._id as ObjectId
  );

  // create new track
  const newTrack: TrackInterface = await Track.create({
    title,
    description,
    type,
    key,
    bpm,
    tags,
    status: "active",
    price,
    genre,
    fileUrl: {
      tagged: taggedFileUrl,
      unTagged: unTaggedFileUrl,
    },
    license: {
      basic: basicLicenseUrl,
      premium: premiumLicenseUrl,
    },
    relatedTrack,
  });
  return newTrack;
};

export default createNewTrack;
