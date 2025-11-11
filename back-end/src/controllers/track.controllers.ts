import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import Track, {
  type FileUrlInterface,
  type LicenseInterface,
  type TrackInterface,
  type createTrackBody,
} from "../models/track.schema.js";
import {
  createNewTrack,
  getTracks,
  updateTrack,
  getCommentAndReplies,
  getAllComments,
  getLicense,
  type TrackUpdates,
  type populatedComment,
  type Queries,
  type tracksResults,
  type Pagination,
} from "../services/track.services.js";
import { deleteFile } from "../middlewares/upload.js";
import logger from "../utils/logger.js";
import AppError from "../errors/appError.js";
import Comment, { type CommentInterface } from "../models/comment.schema.js";

// POST NEW TRACK CONTROLLER
export const postTrackController = async (
  req: Request<{}, ApiResponse<TrackInterface>, createTrackBody, {}>,
  res: Response<ApiResponse<TrackInterface>>,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      type,
      key,
      bpm,
      tags,
      price,
      genre,
    }: createTrackBody = req.body;
    console.log(tags);

    const files = req.files as any;
    if (Object.keys(files).length <= 0)
      throw new AppError("Missing track files", 400, true);

    // construct files bodies
    const fileUrl: FileUrlInterface = {
      tagged: files.taggedBeat[0].path,
      untagged: files.untaggedBeat[0].path,
    };
    const license: LicenseInterface = {
      basic: files.basicLicense[0].path,
      premium: files.premiumLicense[0].path,
    };

    const newTrack = await createNewTrack({
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
    });

    logger.info("New track created succefully.", { trackId: newTrack._id });

    const response: ApiResponse<TrackInterface> = {
      status: true,
      message: "New track created succefully.",
      data: newTrack,
    };

    res.status(201).json(response);
  } catch (error) {
    if (req.files) deleteFile(req.files);
    next(error);
  }
};

// GET TRACKS CONTROLLER
interface response extends ApiResponse<TrackInterface[]> {
  pagination: Pagination;
}

// GET ALL TRACK CONTROLLER
export const getTracksController = async (
  req: Request<{}, ApiResponse<TrackInterface[]>, {}, Queries>,
  res: Response<response>,
  next: NextFunction
): Promise<void> => {
  try {
    const queries = req.query;
    const { tracks, pagination }: tracksResults = await getTracks(queries);

    const response: response = {
      status: true,
      message: "Tracks retrived sucessfully.",
      data: tracks,
      pagination,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// GET TRACK CONTROLLER
export const getTrackController = async (
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response<ApiResponse<TrackInterface>>,
  next: NextFunction
): Promise<void> => {
  try {
    const trackId = req.params.id;

    const track: TrackInterface | null = await Track.findOne({ _id: trackId });
    if (!track) throw new AppError("Track not found.", 404, true);

    const response: ApiResponse<TrackInterface> = {
      status: true,
      message: "Track retrive sucessfully.",
      data: track.removeUnwantedFields(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// DEACTIVATE TRACK CONTROLLER
export const deactivateTrack = async (
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response<ApiResponse<TrackInterface>>,
  next: NextFunction
): Promise<void> => {
  try {
    const trackId = req.params.id;

    const track: TrackInterface | null = await Track.findOneAndUpdate(
      { _id: trackId },
      { $set: { status: "in-active" } },
      { new: true }
    );
    if (!track) throw new AppError("Track not found.", 404, true);
    logger.info("Track status was update to: in-active.", {
      trackId: track._id,
    });

    const response: ApiResponse<TrackInterface> = {
      status: true,
      message: "Track deactivated sucessfully.",
      data: track.removeUnwantedFields(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// DEACTIVATE TRACK CONTROLLER
export const activateTrack = async (
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response<ApiResponse<TrackInterface>>,
  next: NextFunction
): Promise<void> => {
  try {
    const trackId = req.params.id;

    const track: TrackInterface | null = await Track.findOneAndUpdate(
      { _id: trackId },
      { $set: { status: "active" } },
      { new: true }
    );
    if (!track) throw new AppError("Track not found.", 404, true);
    logger.info("Track status was update to: active.", { trackId: track._id });

    const response: ApiResponse<TrackInterface> = {
      status: true,
      message: "Track activated sucessfully.",
      data: track.removeUnwantedFields(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// UPDATE TRACK CONTROLLER
export const updateTrackController = async (
  req: Request<{ id: string }, ApiResponse<TrackInterface>, TrackUpdates, {}>,
  res: Response<ApiResponse<TrackInterface>>,
  next: NextFunction
): Promise<void> => {
  try {
    const trackId = req.params.id;
    const updates = req.body;
    const files = req.files as any;

    const track = await updateTrack(trackId, updates, files);
    const response: ApiResponse<TrackInterface> = {
      status: true,
      message: "Track was updated sucessfully.",
      data: track,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// POST COMMENT
export const postCommentController = async (
  req: Request<
    { id: string },
    ApiResponse<CommentInterface>,
    CommentInterface,
    {}
  >,
  res: Response<ApiResponse<CommentInterface>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId: string | undefined = req.user?.id;
    const data = req.body;
    const trackId = req.params.id;

    // check if track exist
    const track = await Track.findOne({ _id: trackId });
    if (!track) throw new AppError("Track does not exist.", 404, true);

    const comment = await Comment.create({ ...data, trackId, userId });

    const response: ApiResponse<CommentInterface> = {
      status: true,
      message: "Comment posted sucessfully.",
      data: comment,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// GET A COMMENT
export const getCommentController = async (
  req: Request<
    { commentId: string; id: string },
    ApiResponse<populatedComment>,
    {},
    {}
  >,
  res: Response<ApiResponse<populatedComment>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { commentId, id } = req.params;

    // get comment
    const comment: populatedComment = await getCommentAndReplies(commentId, id);
    const response: ApiResponse<populatedComment> = {
      status: true,
      message: "Comment retrive successfully.",
      data: comment,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// GET ALL COMMENTS
export const getAllCommentController = async (
  req: Request<{ id: string }, ApiResponse<populatedComment[]>, {}, {}>,
  res: Response<ApiResponse<populatedComment[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // get comment
    const comments: populatedComment[] = await getAllComments(id);
    const response: ApiResponse<populatedComment[]> = {
      status: true,
      message: "Comments retrive successfully.",
      data: comments,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// UPDATE COMMENT CONTENT
export const updateCommentController = async (
  req: Request<
    { id: string; commentId: string },
    ApiResponse<populatedComment>,
    { content: string },
    {}
  >,
  res: Response<ApiResponse<populatedComment>>,
  next: NextFunction
): Promise<void> => {
  const { id, commentId } = req.params;
  const userId = req.user?.id;
  const content = req.body.content;

  // find and update comment
  const updatedComment = await Comment.findByIdAndUpdate(
    {
      _id: commentId,
      trackId: id,
      userId,
    },
    { $set: { content } },
    { new: true }
  )
    .populate("userId", "_id username isVerified")
    .lean();

  if (!updatedComment) throw new AppError("Comment not found.", 404, true);

  const comment = await getCommentAndReplies(
    updatedComment._id as string,
    updatedComment.trackId as string
  );

  try {
    const response: ApiResponse<populatedComment> = {
      status: true,
      message: "Comment was updated sucessfully.",
      data: comment,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// DELETE A COMMENT AND IT'S REPLIES
export const deleteCommentController = async (
  req: Request<
    { id: string; commentId: string },
    ApiResponse<void>,
    { content: string },
    {}
  >,
  res: Response<ApiResponse<void>>,
  next: NextFunction
): Promise<void> => {
  const { id, commentId } = req.params;
  const userId = req.user?.id;

  // delete comment and replies
  const comment = await Comment.deleteOne({
    _id: commentId,
    trackId: id,
    userId,
  });

  await Comment.deleteMany({
    parentId: commentId,
    trackId: id,
    userId,
  });

  if (!comment) throw new AppError("Comment not found.", 404, true);

  try {
    const response: ApiResponse<void> = {
      status: true,
      message: "Comment was deleted sucessfully.",
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// GET A TRACK LICENSE
export const downloadTrackLicense = async (
  req: Request<{ id: string }, {}, {}, { type: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;
    const user = req.user!;
    const licenseType: string = req.query.type;

    const { fileName, filePath } = await getLicense(user, id, licenseType);

    res.status(200).download(filePath, fileName, (err) => {
      if (err)
        throw new AppError(
          "An error occured while retriving track license",
          500,
          false
        );
    });
  } catch (error) {
    next(error);
  }
};
