import type { ObjectId } from "mongoose";
import AppError from "../errors/appError.js";
import Track, {
  type FileUrlInterface,
  type LicenseInterface,
  type TrackInterface,
} from "../models/track.schema.js";
import Comment, { type CommentInterface } from "../models/comment.schema.js";
import Profile from "../models/profile.schema.js";
import type { userPayload } from "../middlewares/withAuth.js";
import Purchase, { type purchase } from "../models/purchase.schema.js";
import path from "path";
import { type createTrackBody } from "../models/track.schema.js";
import supabase from "./supabase.js";
import { type Pagination } from "../controllers/responseInterface.js";

interface trackData extends createTrackBody {
  license: LicenseInterface;
  fileUrl: FileUrlInterface;
}

// CREATE NEW TRACK SERVICE
export const createNewTrack = async (
  trackbody: trackData
): Promise<TrackInterface> => {
  const {
    title,
    description,
    type,
    key,
    bpm,
    tags,
    price,
    genre,
    license,
    fileUrl,
  } = trackbody;

  //retrive for related tracks
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
    type: type.toLowerCase(),
    key,
    bpm,
    tags: tags.map((tag) => tag.toLowerCase()),
    price,
    genre: genre.toLowerCase(),
    fileUrl,
    license,
    status: "active",
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

// UPDATE TRACK SERVICE
export interface TrackUpdates extends createTrackBody {
  "fileUrl.tagged": string;
  "fileUrl.untagged": string;
  "license.basic": string;
  "license.premium": string;
}

export const updateTrack = async (
  trackId: string,
  trackUpdate: TrackUpdates,
  files: { fileUrl: FileUrlInterface; license: LicenseInterface }
): Promise<TrackInterface> => {
  const T: TrackInterface | null = await Track.findOne({ _id: trackId });
  const oldFilesPaths: string[] = [];

  if (!T) throw new AppError("Track not found.", 404, true);

  // filter update data
  for (const k of Object.keys(trackUpdate) as (keyof createTrackBody)[]) {
    if (Array.isArray(trackUpdate[k]) && trackUpdate[k].length <= 0) {
      delete trackUpdate[k];
    } else if (Array.isArray(trackUpdate[k])) {
      trackUpdate[k] = { $push: trackUpdate[k] };
    } else if (trackUpdate[k] === "") {
      // remove empty string
      delete trackUpdate[k];
    }
  }

  if (Object.keys(files).length > 0) {
    if (files.fileUrl.tagged) {
      trackUpdate["fileUrl.tagged"] = files.fileUrl.tagged;
      oldFilesPaths.push(T.fileUrl.tagged);
    }
    if (files.fileUrl.untagged) {
      trackUpdate["fileUrl.untagged"] = files.fileUrl.untagged;
      oldFilesPaths.push(T.fileUrl.untagged);
    }
    if (files.license.basic) {
      trackUpdate["license.basic"] = files.license.basic;
      oldFilesPaths.push(T.license.basic);
    }
    if (files.license.premium) {
      trackUpdate["license.premium"] = files.license.premium;
      oldFilesPaths.push(T.license.premium);
    }
  }

  const track = await Track.findOneAndUpdate(
    { _id: trackId },
    { $set: { ...trackUpdate } },
    { new: true }
  );
  if (!track) throw new AppError("Unable to update track.", 500, true);

  await supabase.safeRemoveTrackFiles(oldFilesPaths);
  return track.removeUnwantedFields();
};

// GET A COMMENT SERVICE
export interface populatedComment extends Omit<CommentInterface, "userId"> {
  userId: {
    _id: string;
    isVerified: string;
    picture: string;
  };
  replies?: populatedComment[];
}

export const getCommentAndReplies = async (
  commentId: string,
  trackId: string
): Promise<populatedComment> => {
  const comment: populatedComment | any = await Comment.findOne({
    _id: commentId,
    trackId,
  })
    .populate("userId", "_id username isVerified")
    .lean();

  if (!comment) throw new AppError("Comment not found.", 404, true);

  // get user profile
  const profile = await Profile.findOne({ userId: comment.userId._id });

  comment.userId["picture"] = profile?.picture || "";
  const trackReplies: populatedComment[] = await Comment.find({
    parentId: commentId,
  })
    .populate("userId", "_id username isVerified")
    .lean();

  // search for replies
  comment.replies = [];
  if (!trackReplies) return comment;

  //
  comment.replies = await Promise.all(
    trackReplies.map(async (reply) => {
      return getCommentAndReplies(reply._id as string, reply.trackId as string);
    })
  );

  return comment;
};

// GET ALL COMMENTS
export const getAllComments = async (
  id: string
): Promise<populatedComment[]> => {
  let allComments = [];

  const comments: CommentInterface[] = await Comment.find({ trackId: id });
  // get all comments

  allComments = comments.filter((comment) => comment.parentId === null);
  console.log(allComments);
  allComments = await Promise.all(
    allComments.map(async (comment) => {
      return getCommentAndReplies(
        comment._id as string,
        comment.trackId as string
      );
    })
  );

  return allComments;
};

// GET TRACK LICENSE FOR DOWNLOAD
export const downloadTrackFile = async (
  user: userPayload,
  trackId: string,
  licenseType: string,
  requestFile: string
): Promise<{ fileName: string; filePath: string }> => {
  const track: TrackInterface | null = await Track.findOne({ _id: trackId });
  if (!track) throw new AppError("Track not found.", 404, true);

  // add logic later to check if user purchase this track in other to buy it
  let purchasedTrack: purchase | null | boolean = true;
  if (user.role !== "admin") {
    purchasedTrack = await Purchase.findOne({
      trackId,
      userId: user.id,
      type: licenseType,
    });
  } else {
    purchasedTrack = true;
  }

  if (!purchasedTrack)
    throw new AppError(
      "Unable to download license, no purchase found for this track.",
      404,
      true
    );

  let filePath: string = "";
  let fileName = track.title.replace(" ", "_");

  // check for license type
  if (requestFile === "document") {
    if (licenseType === "premium") {
      filePath = track.license.premium;
    } else {
      filePath = track.license.basic;
    }
    fileName =
      fileName + "_" + `${licenseType}_license` + path.extname(filePath);
  } else if (requestFile === "audio") {
    filePath = track.fileUrl.untagged;
    fileName = fileName + "_" + `untagged_audio` + path.extname(filePath);
  } else {
    throw new AppError("Unsupported file type", 400, true);
  }

  return { fileName, filePath };
};
