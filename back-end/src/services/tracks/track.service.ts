import type { FilterQuery, ObjectId } from "mongoose";
import AppError, { ErrorCodes } from "../../errors/appError.js";
import Track, {
  type FileUrlInterface,
  type LicenseInterface,
  type TrackInterface,
  type BeatType,
} from "../../models/track.schema.js";
import supabase, { type uploadedTrackFiles } from "../supabase.js";
import { type Pagination } from "../../controllers/responseInterface.js";

/* Create new track */
export interface createTrackInput {
  title: string;
  description: string;
  type: BeatType;
  key: string;
  bpm: number;
  tags: string[];
  basicPrice: number;
  premiumPrice: number;
  genre: string;
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
    (track): ObjectId => track._id as ObjectId,
  );

  return relatedTrack;
}

export const createNewTrack = async (
  trackbody: createTrackInput,
): Promise<TrackInterface> => {
  const { type, tags, genre } = trackbody;
  const relatedTrack = await retriveRelatedTracks({ type, genre, tags });

  const newTrack: TrackInterface = await Track.create({
    ...trackbody,
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
  tags: string[] | string,
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
  matches.status = "active"; // users should not get inactive track

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
  limit: number,
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
    limit,
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
export interface TrackUpdates extends createTrackInput {
  "fileUrl.tagged"?: string;
  "fileUrl.untagged"?: string;
  "license.basic"?: string;
  "license.premium"?: string;
}

function filterUpdatesAndFiles(
  trackUpdates: TrackUpdates,
  files: uploadedTrackFiles,
  track: TrackInterface,
): { cleanUpdateData: TrackUpdates; oldFilesPaths: string[] } {
  const oldFilesPaths: string[] = [];
  const updates: any = {};

  for (const key of Object.keys(trackUpdates) as (keyof createTrackInput)[]) {
    if (Array.isArray(trackUpdates[key]) && trackUpdates[key].length > 0) {
      // This will replace the old Array if the Array in the trackUpdates is not empty
      updates[key] = trackUpdates[key];
    } else if (
      (typeof trackUpdates[key] === "string" && trackUpdates[key] === "") ||
      (typeof trackUpdates[key] === "number" && trackUpdates[key] <= 0)
    ) {
      continue;
    } else {
      updates[key] = trackUpdates[key];
    }
  }

  // Filter file and push old file so they can be deleted after replacing them
  if (Object.keys(files).length > 0) {
    if (files.fileUrl?.tagged) {
      updates["fileUrl.tagged"] = files.fileUrl.tagged;
      oldFilesPaths.push(track.fileUrl.tagged);
    }
    if (files.fileUrl?.untagged) {
      updates["fileUrl.untagged"] = files.fileUrl.untagged;
      oldFilesPaths.push(track.fileUrl.untagged);
    }
    if (files.license?.basic) {
      updates["license.basic"] = files.license.basic;
      oldFilesPaths.push(track.license.basic);
    }
    if (files.license?.premium) {
      updates["license.premium"] = files.license.premium;
      oldFilesPaths.push(track.license.premium);
    }
    if (files.coverImageUrl) {
      updates["coverImageUrl"] = files.coverImageUrl;
      oldFilesPaths.push(track.coverImagePath);
    }
  }

  return { cleanUpdateData: updates, oldFilesPaths };
}

export const updateTrack = async (
  trackId: string,
  trackUpdates: TrackUpdates,
  files: uploadedTrackFiles,
): Promise<TrackInterface> => {
  const track: TrackInterface | null = await Track.findOne({ _id: trackId });
  if (!track)
    throw new AppError(
      ErrorCodes.TRACK_NOT_FOUND,
      "Track not found.",
      404,
      true,
      null,
    );

  const { cleanUpdateData, oldFilesPaths } = filterUpdatesAndFiles(
    trackUpdates,
    files,
    track,
  );

  const updatedTrack = await Track.findOneAndUpdate(
    { _id: trackId },
    { $set: { ...cleanUpdateData } },
    { new: true },
  );
  if (!updatedTrack)
    throw new AppError(
      ErrorCodes.TRACK_UPDATE_ERROR,
      "Unable to update track.",
      500,
      true,
      null,
    );

  if (oldFilesPaths.length > 0)
    await supabase.safeRemoveTrackFiles(oldFilesPaths);
  return updatedTrack.removeUnwantedFields();
};
