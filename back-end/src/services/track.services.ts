import type mongoose from "mongoose";
import type { ObjectId } from "mongoose";
import AppError from "../errors/appError.js";
import Track, {
  type FileUrlInterface,
  type LicenseInterface,
  type TrackInterface,
} from "../models/track.schema.js";
import Comment, { type CommentInterface } from "../models/comment.schema.js";
import Profile, { type ProfileDocument } from "../models/profile.schema.js";
import type { userPayload } from "../middlewares/withAuth.js";

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
  fileUrl: FileUrlInterface;
  license: LicenseInterface;
}

export const createNewTrack = async (
  trackData: TrackData
): Promise<TrackInterface> => {
  const { type, genre, tags } = trackData;

  //look for related tracks
  const tracks = await Track.find({ type, genre, tags: { $in: tags } })
    .limit(5)
    .sort({ createdAt: -1 });
  const relatedTrack: ObjectId[] = tracks.map(
    (track): ObjectId => track._id as ObjectId
  );

  // create new track
  const newTrack: TrackInterface = await Track.create({
    ...trackData,
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

// UPDATE TRACK SERVICE
export interface TrackUpdates extends TrackData {
  "fileUrl.tagged": string;
  "fileUrl.untagged": string;
  "license.basic": string;
  "license.premium": string;
}

export const updateTrack = async (
  trackId: string,
  trackUpdate: TrackUpdates,
  files?: any
): Promise<TrackInterface> => {
  // filter update data
  for (const k of Object.keys(trackUpdate) as (keyof TrackData)[]) {
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
    if (files.taggedBeat?.length > 0)
      trackUpdate["fileUrl.tagged"] = files.taggedBeat[0].path;
    if (files.untaggedBeat?.length > 0)
      trackUpdate["fileUrl.untagged"] = files.untaggedBeat[0].path;
    if (files.basicLicense?.length > 0)
      trackUpdate["license.basic"] = files.basicLicense[0].path;
    if (files.premiumLicense?.length > 0)
      trackUpdate["license.premium"] = files.premiumLicense[0].path;
  }

  const track = await Track.findOneAndUpdate(
    { _id: trackId },
    { $set: { ...trackUpdate } },
    { new: true }
  );
  if (!track) throw new AppError("Track not found", 404, true);

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
  if (!trackReplies) return [] as any;

  for (const R of trackReplies) {
    let reply = await getCommentAndReplies(
      R._id as string,
      R.trackId as string
    );
    comment.replies.push(reply);
  }

  return comment;
};

// GET ALL COMMENTS
export const getAllComments = async (
  id: string
): Promise<populatedComment[]> => {
  const allComments = [];

  const comments: CommentInterface[] = await Comment.find({ trackId: id });
  for (const comment of comments) {
    if (comment.parentId === null) {
      let C = await getCommentAndReplies(
        comment._id as string,
        comment.trackId as string
      );
      allComments.push(C);
    }
  }

  return allComments;
};
