import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "../responseInterface.js";
import Track, { type TrackInterface } from "../../models/track.schema.js";
import type { tracksResults } from "../../services/tracks/track.service.js";
import * as trackService from "../../services/tracks/track.service.js";
import { retriveTrackFilePaths } from "../../services/tracks/trackDownloadFile.service.js";
import { type Pagination } from "../responseInterface.js";
import logger from "../../utils/logger.js";
import AppError, { ErrorCodes } from "../../errors/appError.js";
import supabase, { type uploadedTrackFiles } from "../../services/supabase.js";
import { Readable } from "stream";
import { fileTypeFromBlob } from "file-type";
import * as notificationService from "../../services/notification.service.js";
import env from "../../configs/env.js";
import * as trackValidator from "../../utils/validators/track.validator.js";
import validateAndSanitizeBody from "../../utils/validators/validateAndSanitize.js";
import { type createTrackInput } from "../../services/tracks/track.service.js";
import { validateTrackidParam } from "../../utils/validators/track.validator.js";
import type { MulterTrackFiles } from "../../middlewares/upload.js";

/* Post new track  */
const bundleTrackFilesPath = (files: uploadedTrackFiles): string[] => {
  if (!files || Object.keys(files).length <= 0) return [];

  const paths: string[] = [];
  if (files.audioUrl?.tagged) paths.push(files.audioUrl.tagged);
  if (files.audioUrl?.untagged) paths.push(files.audioUrl.untagged);
  if (files.licenseUrl?.basic) paths.push(files.licenseUrl.basic);
  if (files.licenseUrl?.premium) paths.push(files.licenseUrl.premium);
  if (files.coverImagePath) paths.push(files.coverImagePath);

  return paths;
};

export const postTrack = async (
  req: Request<{}, ApiResponse<TrackInterface>, createTrackInput, {}>,
  res: Response<ApiResponse<TrackInterface>>,
  next: NextFunction,
): Promise<void> => {
  let paths: string[] = [];

  try {
    const files = req.files as MulterTrackFiles;

    trackValidator.validateTrackFiles(files);
    const trackData = validateAndSanitizeBody(
      req.body,
      trackValidator.trackBodySchema,
    );

    const trackFiles = await supabase.uploadTrackFiles(files);
    paths = bundleTrackFilesPath(trackFiles); // Save track files path for rollback incase of an error

    const newTrack = await trackService.createNewTrack(trackData, trackFiles);

    const response: ApiResponse<TrackInterface> = {
      status: true,
      message: "New track created successfully.",
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

/* Get all tracks */
interface response extends ApiResponse<TrackInterface[]> {
  pagination: Pagination;
}

export const getTracks = async (
  req: Request<{}, ApiResponse<TrackInterface[]>, {}>,
  res: Response<response>,
  next: NextFunction,
): Promise<void> => {
  try {
    const queries = validateAndSanitizeBody(
      req.query,
      trackValidator.trackQueriesSchema,
    );

    const { tracks, pagination }: tracksResults =
      await trackService.getTracks(queries);

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

/* Get track handler */
export const getTrack = async (
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response<ApiResponse<TrackInterface>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const trackId = validateTrackidParam(req.params.id);

    const track = await trackService.getSingleTrack(trackId);

    const response: ApiResponse<TrackInterface> = {
      status: true,
      message: "Track retrived sucessfully.",
      data: track,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Publish Track handler */
export const publishTrack = async (
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response<ApiResponse<TrackInterface>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const trackId = validateTrackidParam(req.params.id);

    const track = await trackService.publishTrack(trackId);

    const response: ApiResponse<TrackInterface> = {
      status: true,
      message: "Track published sucessfully.",
      data: track,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Unpublished track handler */
export const unpublishTrack = async (
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response<ApiResponse<TrackInterface>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const trackId = validateTrackidParam(req.params.id);

    const track = await trackService.unpublishTrack(trackId);

    const response: ApiResponse<TrackInterface> = {
      status: true,
      message: "Track was unpublished sucessfully.",
      data: track,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Update track */
export const updateTrack = async (
  req: Request<
    { id: string },
    ApiResponse<TrackInterface>,
    createTrackInput,
    {}
  >,
  res: Response<ApiResponse<TrackInterface>>,
  next: NextFunction,
): Promise<void> => {
  let paths: string[] = [];

  try {
    const trackId = validateTrackidParam(req.params.id);
    const files = req.files as MulterTrackFiles;

    const trackData = validateAndSanitizeBody(
      req.body,
      trackValidator.trackUpdateBodySchema,
    );

    // upload files if any
    const trackFiles = await supabase.uploadTrackFiles(files);
    paths = bundleTrackFilesPath(trackFiles);

    const updatedTrack = await trackService.updateTrack(
      trackId,
      trackData,
      trackFiles,
    );

    const response: ApiResponse<TrackInterface> = {
      status: true,
      message: "Track updated sucessfully.",
      data: updatedTrack,
    };

    res.status(200).json(response);
  } catch (error) {
    // clean files
    if (paths && paths.length > 0) {
      await supabase.safeRemoveTrackFiles(paths);
    }
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
      bucket = env.DOCUMENT_FILES_BUCKET;
      break;
  }

  const { data, error } = await supabase.client.from(bucket).download(filePath);
  if (error) {
    logger.error("An error occur while downloading file.", error);
    throw new AppError(
      ErrorCodes.TRACK_DOWNLOAD_ERROR,
      "Download error.",
      500,
      true,
      null,
    );
  }

  return data;
}

export const downloadTrackFile = async (
  req: Request<{ id: string }, {}, {}, { type: string; license: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user!;
    const id = validateTrackidParam(req.params.id);
    const { type, license } = validateAndSanitizeBody(
      req.query,
      trackValidator.downloadQuerySchema,
    );

    const { fileName, filePath } = await retriveTrackFilePaths(
      user,
      id,
      license,
      type,
    );

    const data = await retriveTrackFile(type, filePath);
    const readable = Readable.fromWeb(data.stream()); // Stream for fast download

    // set headers
    const fileTYpe = await fileTypeFromBlob(data);
    const contentType: string = fileTYpe?.mime || "application/octet-stream";
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}";`);
    res.setHeader("Content-Type", contentType!);

    readable.pipe(res);
    res.on("close", async () => {
      if (!res.writableEnded) return;
      // Notify user: so user will know the file was download
      await notificationService.postNewNotification(
        user.id,
        "File downloaded sucessfully.",
        "DOWNLOAD_COMPLETED",
        id,
      );
    });
  } catch (error) {
    next(error);
  }
};

/* Play track controller */
export const playTrack = async (
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response,
  next: NextFunction,
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
