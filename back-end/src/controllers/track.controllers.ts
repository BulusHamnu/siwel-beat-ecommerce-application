import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import Track, {
  type TrackInterface,
  type createTrackBody,
} from "../models/track.schema.js";
import {
  createNewTrack,
  getTracks,
  updateTrack,
  type TrackUpdates,
  type Queries,
  type tracksResults,
} from "../services/tracks/track.services.js";
import {
  postNewComment,
  getAllComments,
  getCommentAndReplies,
  type populatedComment,
  updateComment,
  deleteComment,
} from "../services/tracks/comment.services.js";
import { retriveTrackFilePaths } from "../services/tracks/download-track-file.services.js";
import { type Pagination } from "./responseInterface.js";
import logger from "../utils/logger.js";
import AppError from "../errors/appError.js";
import { type CommentInterface } from "../models/comment.schema.js";
import supabase from "../services/supabase.js";
import Stream, { Readable } from "stream";
import { fileTypeFromBlob } from "file-type";
import { postNewNotification } from "../services/notification.services.js";
import env from "../configs/env.js";

/* Post new track controller */
export const postTrackController = async (
  req: Request<{}, ApiResponse<TrackInterface>, createTrackBody, {}>,
  res: Response<ApiResponse<TrackInterface>>,
  next: NextFunction
): Promise<void> => {
  let paths: string[] = [];

  try {
    const files = req.files as any;
    const data: createTrackBody = req.body;
    // check for files
    if (Object.keys(files).length <= 3)
      throw new AppError("Missing track files.", 404, true);

    // upload files
    const uploaded = await supabase.uploadTrackFiles(files);
    paths = [
      uploaded.fileUrl.tagged,
      uploaded.fileUrl.untagged,
      uploaded.license.basic,
      uploaded.license.premium,
    ];

    const newTrack = await createNewTrack({
      ...data,
      fileUrl: uploaded.fileUrl,
      license: uploaded.license,
    });

    logger.info("New track created succefully.", { trackId: newTrack._id });
    const response: ApiResponse<TrackInterface> = {
      status: true,
      message: "New track created succefully.",
      data: newTrack,
    };

    res.status(201).json(response);
  } catch (error: any) {
    // clean files
    if (paths && paths.length > 0) {
      await supabase.safeRemoveTrackFiles(paths);
    }

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

/* Update track controler */
export const updateTrackController = async (
  req: Request<{ id: string }, ApiResponse<TrackInterface>, TrackUpdates, {}>,
  res: Response<ApiResponse<TrackInterface>>,
  next: NextFunction
): Promise<void> => {
  let paths: string[] = [];

  try {
    const trackId = req.params.id;
    const updates = req.body;
    const files = req.files as any;

    // upload files if any
    const uploaded = await supabase.uploadTrackFiles(files);

    paths = [
      uploaded.fileUrl.tagged,
      uploaded.fileUrl.untagged,
      uploaded.license.basic,
      uploaded.license.premium,
    ];

    const updatedTrack = await updateTrack(trackId, updates, uploaded);
    const response: ApiResponse<TrackInterface> = {
      status: true,
      message: "Track was updated sucessfully.",
      data: updatedTrack,
    };
    logger.info("Track was updated succesfully.", {
      id: updatedTrack._id,
    });

    res.status(200).json(response);
  } catch (error) {
    // clean files
    if (paths && paths.length > 0) {
      await supabase.safeRemoveTrackFiles(paths);
    }
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
    const userId = req.user!.id;
    const data = req.body;
    const trackId = req.params.id;

    const comment = await postNewComment(trackId, userId, data);
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
      message: "Comments retrived successfully.",
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
  try {
    const { id, commentId } = req.params;
    const userId = req.user!.id;
    const content = req.body.content;

    const updatedComment = await updateComment(commentId, id, userId, content);

    const response: ApiResponse<populatedComment> = {
      status: true,
      message: "Comment was updated sucessfully.",
      data: updatedComment,
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
  try {
    const { id, commentId } = req.params;
    const userId = req.user!.id;

    await deleteComment(commentId, id, userId);
    const response: ApiResponse<void> = {
      status: true,
      message: "Comment was deleted sucessfully.",
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Download track files controllers */
async function retriveTrackFile(type: string, filePath: string): Promise<any> {
  // Get bucket name: so item can be retrive from the right bucket
  let bucket = "";
  switch (type) {
    case "audio":
      bucket = env.AUDIO_FILES_BUCKET;
      break;
    case "license":
      bucket = env.LICENSE_FILES_BUCKET;
      break;
  }

  const { data, error } = await supabase.client.from(bucket).download(filePath);
  if (error) {
    logger.error("An error occur while downloading file from supabase", error);
    throw new AppError("Download error.", 500, true);
  }

  return data;
}

export const downloadTrackFileController = async (
  req: Request<{ id: string }, {}, {}, { type: string; license: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;
    const user = req.user!;
    const { type, license } = req.query;

    const { fileName, filePath } = await retriveTrackFilePaths(
      user,
      id,
      license,
      type
    );

    const data = await retriveTrackFile(type, filePath);
    const readable = Readable.fromWeb(data.stream()); // Stream for fast and reliable download

    // set headers
    const fileTYpe = await fileTypeFromBlob(data);
    const contentType: string = fileTYpe?.mime || "application/octet-stream";
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}";`);
    res.setHeader("Content-Type", contentType!);

    readable.pipe(res);
    res.on("close", async () => {
      if (!res.writableEnded) return;
      // Notify user: so user will know the file was download
      await postNewNotification(
        user.id,
        "File downloaded sucessfully.",
        "DOWNLOAD_COMPLETED",
        id
      );
    });
  } catch (error) {
    next(error);
  }
};

// PLAY TRACK CONTROLLER
export const playTrackController = async (
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const range = req.headers["range"]; //?.split("=")[1];

    const track = await Track.findOne({ _id: id });
    if (!track) return res.status(404);

    const filePath = track?.fileUrl.untagged;

    const { data, error } = await supabase.client
      .from("audios")
      .createSignedUrl(filePath, 60);

    // send 500
    if (error) {
      logger.error("An error occur while while streaming audio file.", error);
      return res.status(500);
    }

    const url = data.signedUrl;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Range: range!,
      },
    });

    // extract major headers from the response
    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");
    const contentRange = response.headers.get("content-range");

    res.setHeader("Content-Type", contentType!);
    res.setHeader("Content-Length", contentLength!);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Range", contentRange!);

    const stream = Readable.fromWeb(response.body as any); // change res web buffer to node streamable
    res.status(response.status);
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};
