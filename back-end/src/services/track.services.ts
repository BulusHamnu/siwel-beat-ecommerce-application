import type mongoose from "mongoose";
import type { ObjectId } from "mongoose";
import AppError from "../errors/appError.js";
import Track, { type TrackInterface } from "../models/track.schema.js";

// CREATE NEW TRACK SERVICE
// track interface
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

export const createNewTrack = async ({
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

// GET ALL TRACKS SERVICE
export interface Queries {
  limit: number;
  page: number;
  genre: string;
  search: string;
  type: string;
  tags: string[] | string;
}

export interface Pagination {
  page: number;
  limit: number;
  hasNext: boolean;
  totalPage: number;
}

export interface tracksResults {
  tracks: TrackInterface[];
  pagination: Pagination;
}

export const getTracks = async ({
  limit = 10,
  page = 1,
  genre,
  search,
  type,
  tags,
}: Queries): Promise<tracksResults> => {
  // contrust queries
  const matches: any = {};
  if (genre) matches.genre = genre.toLowerCase();
  if (type) matches.type = type.toLowerCase();
  // matches.status = "active"; // only show active tracks

  if (tags) {
    tags?.length > 0 && Array.isArray(tags)
      ? (matches.tags = { $in: tags.map((tag) => tag.toLowerCase()) })
      : (matches.tags = { $in: [tags] });
  }

  let queries: any = {
    $and: [
      {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      },
      { ...matches },
    ],
  };

  if (!search) queries = matches;
  const totalTracksCount: number = await Track.find(queries).countDocuments();

  limit = Number(limit);
  page = Number(page);

  const totalPage = Math.ceil(totalTracksCount / limit); // calculate total page
  const skip = (page - 1) * limit; // calculate skip

  // get tracks
  let tracks: TrackInterface[] = await Track.find(queries)
    .skip(skip)
    .limit(limit + 1)
    .sort({ createdAt: -1 });

  const hasNext = tracks.length > limit;

  // slice tracks to limit and remove fileurl and license
  tracks = tracks.slice(0, limit);
  tracks = tracks.map((track) => track.removeUnwantedFields());

  // return pagination
  const pagination: Pagination = {
    totalPage,
    page,
    limit,
    hasNext,
  };

  return { tracks, pagination };
};
