import type { FilterQuery, ObjectId, Query, UpdateQuery } from "mongoose";
import AppError from "../../errors/appError.js";
import Track, {
  type FileUrlInterface,
  type LicenseInterface,
  type TrackInterface,
  type createTrackBody,
} from "../../models/track.schema.js";
import supabase from "../supabase.js";
import { type Pagination } from "../../controllers/responseInterface.js";

/* Create new track */
interface createTrackInput extends createTrackBody {
  license: LicenseInterface;
  fileUrl: FileUrlInterface;
}

async function retriveRelatedTracks({
  type,
  genre,
  tags,
}: {
  type: string;
  genre: string;
  tags: string[];
}) {
  const tracks = await Track.find({ type, genre, tags: { $in: tags } })
    .limit(5)
    .sort({ createdAt: -1 });
  const relatedTrack: ObjectId[] = tracks.map(
    (track): ObjectId => track._id as ObjectId
  );

  return relatedTrack;
}

export const createNewTrack = async (
  trackbody: createTrackInput
): Promise<TrackInterface> => {
  const {
    title,
    description,
    type,
    key,
    bpm,
    tags,
    basicPrice,
    premiumPrice,
    genre,
    license,
    fileUrl,
  } = trackbody;

  const relatedTrack = await retriveRelatedTracks({ type, genre, tags });
  const newTrack: TrackInterface = await Track.create({
    title,
    description,
    type: type.toLowerCase(),
    key,
    bpm,
    tags: tags.map((tag) => tag.toLowerCase()),
    basicPrice,
    premiumPrice,
    genre: genre.toLowerCase(),
    fileUrl,
    license,
    status: "active",
    relatedTrack,
  });
  return newTrack;
};

/* Get all tracks */
export interface tracksResults {
  tracks: TrackInterface[];
  pagination: Pagination;
}

function buildTrackQueries(
  genre: string,
  search: string,
  type: string,
  tags: string[] | string
): unknown {
  // Filter should match request
  const matches: {
    genre?: string;
    type?: string;
    status?: string;
    tags?: { $in: string[] };
  } = {};

  if (genre) matches.genre = genre.toLowerCase();
  if (type) matches.type = type.toLowerCase();
  matches.status = "active"; // users should not get in-active track

  if (tags) {
    tags?.length > 0 && Array.isArray(tags)
      ? (matches.tags = { $in: tags.map((tag) => tag.toLowerCase()) })
      : (matches.tags = { $in: [tags as string] });
  }

  let queries: FilterQuery<any> = {
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

  return queries;
}

async function getTracksAndTrackCount(
  queries: any,
  skip: number,
  limit: number
) {
  const countsQuery = Track.find(queries).countDocuments();
  let tracksQuery = Track.find(queries)
    .skip(skip)
    .limit(limit + 1)
    .sort({ createdAt: -1 });

  const [totalTracksCount, tracksWithExtra] = await Promise.all([
    countsQuery,
    tracksQuery,
  ]);

  return { totalTracksCount, tracksWithExtra };
}

export interface Queries {
  limit: number;
  page: number;
  genre: string;
  search: string;
  type: string;
  tags: string[] | string;
}

export const getTracks = async ({
  limit = 10,
  page = 1,
  genre,
  search,
  type,
  tags,
}: Queries): Promise<tracksResults> => {
  limit = Number(limit);
  page = Number(page);
  const skip = (page - 1) * limit; // calculate skip

  const queries = buildTrackQueries(genre, search, type, tags);
  const { totalTracksCount, tracksWithExtra } = await getTracksAndTrackCount(
    queries,
    skip,
    limit
  );

  const totalPage = Math.ceil(totalTracksCount / limit);
  const hasNext = tracksWithExtra.length > limit;

  // Prevent exposing files urls
  let tracks: TrackInterface[] = tracksWithExtra.slice(0, limit);
  tracks = tracks.map((track) => track.removeUnwantedFields());

  const pagination: Pagination = {
    totalPage,
    page,
    limit,
    hasNext,
  };

  return { tracks, pagination };
};

/* Update track */
export interface TrackUpdates extends createTrackBody {
  "fileUrl.tagged": string;
  "fileUrl.untagged": string;
  "license.basic": string;
  "license.premium": string;
}

function filterUpdatesAndFiles(
  trackUpdates: TrackUpdates,
  files: { fileUrl: FileUrlInterface; license: LicenseInterface },
  track: TrackInterface
) {
  const oldFilesPaths: string[] = [];
  const updates: UpdateQuery<any> = {};

  for (const key of Object.keys(trackUpdates) as (keyof createTrackBody)[]) {
    if (Array.isArray(trackUpdates[key]) && trackUpdates[key].length > 0) {
      updates[key] = trackUpdates[key];
    } else if (
      typeof trackUpdates[key] === "string" &&
      trackUpdates[key] !== ""
    ) {
      updates[key] = trackUpdates[key];
    } else {
      updates[key] = trackUpdates[key];
    }
  }

  // filter file and push old file so them can be deleted after replacing them
  if (Object.keys(files).length > 0) {
    if (files.fileUrl.tagged) {
      updates["fileUrl.tagged"] = files.fileUrl.tagged;
      oldFilesPaths.push(track.fileUrl.tagged);
    }
    if (files.fileUrl.untagged) {
      updates["fileUrl.untagged"] = files.fileUrl.untagged;
      oldFilesPaths.push(track.fileUrl.untagged);
    }
    if (files.license.basic) {
      updates["license.basic"] = files.license.basic;
      oldFilesPaths.push(track.license.basic);
    }
    if (files.license.premium) {
      updates["license.premium"] = files.license.premium;
      oldFilesPaths.push(track.license.premium);
    }
  }

  return { cleanUpdateData: updates, oldFilesPaths };
}

export const updateTrack = async (
  trackId: string,
  trackUpdates: TrackUpdates,
  files: { fileUrl: FileUrlInterface; license: LicenseInterface }
): Promise<TrackInterface> => {
  const track: TrackInterface | null = await Track.findOne({ _id: trackId });
  if (!track) throw new AppError("Track not found.", 404, true);

  const { cleanUpdateData, oldFilesPaths } = filterUpdatesAndFiles(
    trackUpdates,
    files,
    track
  );

  const updatedTrack = await Track.findOneAndUpdate(
    { _id: trackId },
    { $set: { ...cleanUpdateData } },
    { new: true }
  );
  if (!updatedTrack) throw new AppError("Unable to update track.", 500, true);

  await supabase.safeRemoveTrackFiles(oldFilesPaths);
  return updatedTrack.removeUnwantedFields();
};
