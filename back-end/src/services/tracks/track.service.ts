import type { FilterQuery, ObjectId } from "mongoose";
import AppError, { ErrorCodes } from "../../errors/appError.js";
import Track, {
  type TrackInterface,
  type BeatType,
} from "../../models/track.schema.js";
import type { LicenseInput, AudioInput } from "../supabase.js";
import supabase, { type uploadedTrackFiles } from "../supabase.js";
import { type Pagination } from "../../controllers/responseInterface.js";
import logger from "../../utils/logger.js";
import Audio, { type AudioInterface } from "../../models/audio.schema.js";
import License, {
  LicenseType,
  type LicenseInterface,
} from "../../models/license.schema.js";
import mongoose from "mongoose";

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
  trackData: createTrackInput,
  trackFiles: uploadedTrackFiles,
): Promise<TrackInterface> => {
  const { type, tags, genre } = trackData;
  const relatedTrack = await retriveRelatedTracks({ type, genre, tags });

  const { audioUrl, licenseUrl, coverImagePath, coverImageUrl } = trackFiles;

  const session = await mongoose.startSession();

  let newTrack: TrackInterface | null = null;
  await session.withTransaction(async () => {
    newTrack = new Track({
      ...trackData,
      status: "active",
      relatedTrack,
      coverImagePath,
      coverImageUrl,
    });
    await newTrack.save({ session });

    const newTrackAudios = new Audio({
      trackId: newTrack._id,
      ...audioUrl,
    });
    await newTrackAudios.save({ session });

    const newTrackLicenses = new License({
      trackId: newTrack._id,
      ...licenseUrl,
    });
    await newTrackLicenses.save({ session });
  });

  logger.info("New track created succefully.", { trackId: newTrack!._id });
  return newTrack!;
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

  const tracks: TrackInterface[] = tracksWithExtra.slice(0, limit);

  const pagination: Pagination = {
    totalPage,
    page,
    limit,
    hasNext,
  };

  return { tracks, pagination };
};

/* Get a single track */
export async function getSingleTrack(trackId: string): Promise<TrackInterface> {
  const track: TrackInterface | null = await Track.findOne({
    _id: trackId,
  }).populate(
    "relatedTrack",
    "_id coverImageUrl title basicPrice premiumPrice description key type status bpm tags genre",
  );

  if (!track)
    throw new AppError(
      ErrorCodes.TRACK_NOT_FOUND,
      "Track not found.",
      404,
      true,
      null,
    );

  return track;
}

/* Deactivate track */
export async function deactivateTrack(
  trackId: string,
): Promise<TrackInterface> {
  const track: TrackInterface | null = await Track.findOneAndUpdate(
    { _id: trackId },
    { $set: { status: "inactive" } },
    { new: true },
  );

  if (!track)
    throw new AppError(
      ErrorCodes.TRACK_NOT_FOUND,
      "Track not found.",
      404,
      true,
      null,
    );

  logger.info("Track status was update to: inactive.", {
    trackId: track._id,
  });

  return track;
}

/* Activate track */
export async function activateTrack(trackId: string): Promise<TrackInterface> {
  const track: TrackInterface | null = await Track.findOneAndUpdate(
    { _id: trackId },
    { $set: { status: "active" } },
    { new: true },
  );

  if (!track)
    throw new AppError(
      ErrorCodes.TRACK_NOT_FOUND,
      "Track not found.",
      404,
      true,
      null,
    );

  logger.info("Track status was update to: active.", { trackId: track._id });

  return track;
}

/* Update track */
interface trackUpdateInput extends createTrackInput {
  coverImageUrl?: string | undefined;
  coverImagePath?: string | undefined;
}

function filterTrackUpdates(trackUpdates: trackUpdateInput): trackUpdateInput {
  const updates: any = {};

  for (const key of Object.keys(trackUpdates) as (keyof createTrackInput)[]) {
    const invalidField =
      !trackUpdates[key] ||
      (typeof trackUpdates[key] === "string" && trackUpdates[key] === "") ||
      (typeof trackUpdates[key] === "number" && trackUpdates[key] <= 0);

    if (invalidField) {
      continue;
    } else if (
      Array.isArray(trackUpdates[key]) &&
      trackUpdates[key].length > 0
    ) {
      // This will replace the old Array if the Array in the trackUpdates is not empty
      updates[key] = trackUpdates[key];
    } else {
      updates[key] = trackUpdates[key];
    }
  }

  return updates;
}

async function prepareFileUpdatesAndOldPaths(
  trackId: string,
  licenseUrl: LicenseInput | undefined,
  audioUrl: AudioInput | undefined,
) {
  const oldFilesPath: string[] = [];

  const licenseUpdate: Partial<LicenseInterface> = {};
  if (licenseUrl && Object.keys(licenseUrl)?.length > 0) {
    const licenseFiles = await License.findOne({
      trackId,
    }).lean<LicenseInterface>();

    if (licenseUrl.basic) {
      licenseUpdate["basic"] = licenseUrl.basic;
      if (licenseFiles?.basic) oldFilesPath.push(licenseFiles.basic);
    }

    if (licenseUrl.premium) {
      licenseUpdate["premium"] = licenseUrl.premium;
      if (licenseFiles?.premium) oldFilesPath.push(licenseFiles?.premium);
    }
  }

  const audioUpdate: Partial<AudioInterface> = {};
  if (audioUrl && Object.keys(audioUrl!)?.length > 0) {
    const audioFiles = await Audio.findOne({ trackId }).lean<AudioInterface>();

    if (audioUrl.tagged) {
      audioUpdate["tagged"] = audioUrl.tagged;
      if (audioFiles?.tagged) oldFilesPath.push(audioFiles?.tagged);
    }

    if (audioUrl.untagged) {
      audioUpdate["untagged"] = audioUrl.untagged;
      if (audioFiles?.untagged) oldFilesPath.push(audioFiles?.untagged);
    }
  }

  return { oldFilesPath, licenseUpdate, audioUpdate };
}

export const updateTrack = async (
  trackId: string,
  trackUpdates: createTrackInput,
  files: uploadedTrackFiles,
): Promise<TrackInterface> => {
  const track = await Track.findOne({ _id: trackId }).lean<TrackInterface>();
  if (!track)
    throw new AppError(
      ErrorCodes.TRACK_NOT_FOUND,
      "Track not found.",
      404,
      true,
      null,
    );

  const { audioUrl, licenseUrl, coverImagePath, coverImageUrl } = files;
  const updates = filterTrackUpdates({
    ...trackUpdates,
    coverImagePath,
    coverImageUrl,
  });

  const { oldFilesPath, licenseUpdate, audioUpdate } =
    await prepareFileUpdatesAndOldPaths(trackId, licenseUrl, audioUrl);

  if (coverImagePath) oldFilesPath.push(track.coverImagePath);

  let updatedTrack: TrackInterface | null = null;
  const session = await mongoose.startSession();

  await session.withTransaction(async () => {
    updatedTrack = await Track.findOneAndUpdate(
      { _id: trackId },
      { $set: { ...updates } },
      { new: true, session },
    );

    await Audio.updateOne(
      { trackId: track._id },
      { $set: { ...audioUpdate } },
      { session },
    );

    await License.updateOne(
      { trackId: track._id },
      { $set: { ...licenseUpdate } },
      { session },
    );

    if (oldFilesPath.length > 0)
      await supabase.safeRemoveTrackFiles(oldFilesPath);
  });

  logger.info(`Track was updated succesfully id: ${updatedTrack!._id}`);
  return updatedTrack!;
};
