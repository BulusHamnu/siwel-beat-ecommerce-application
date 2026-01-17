import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "../responseInterface.js";
import Track, { type TrackInterface } from "../../models/track.schema.js";
import type {
  TrackUpdates,
  Queries,
  tracksResults,
} from "../../services/tracks/track.service.js";
import * as trackService from "../../services/tracks/track.service.js";
import { retriveTrackFilePaths } from "../../services/tracks/trackDownloadFile.service.js";
import { type Pagination } from "../responseInterface.js";
import logger from "../../utils/logger.js";
import AppError from "../../errors/appError.js";
import supabase, { type uploadedTrackFiles } from "../../services/supabase.js";
import { Readable } from "stream";
import { fileTypeFromBlob } from "file-type";
import * as notificationService from "../../services/notification.service.js";
import env from "../../configs/env.js";
import * as trackValidator from "../../utils/validators/track.validator.js";
import validateAndSanitizeBody from "../../utils/validators/validateAndSanitize.js";
import { type createTrackInput } from "../../services/tracks/track.service.js";
import { validateTrackidParam } from "../../utils/validators/track.validator.js";
import type { multerTrackFiles } from "../../middlewares/upload.js";

/* Post new track controller */
const bundleTrackFilesPath = (files: uploadedTrackFiles): string[] => {
  if (!files || Object.keys(files).length <= 0) return [];

  const paths: string[] = [];
  if (files.fileUrl?.tagged) paths.push(files.fileUrl.tagged);
  if (files.fileUrl?.untagged) paths.push(files.fileUrl.untagged);
  if (files.license?.basic) paths.push(files.license.basic);
  if (files.license?.premium) paths.push(files.license.premium);
  if (files.coverImagePath) paths.push(files.coverImagePath);

  return paths;
};

export const postTrack = async (
  req: Request<{}, ApiResponse<TrackInterface>, createTrackInput, {}>,
  res: Response<ApiResponse<TrackInterface>>,
  next: NextFunction
): Promise<void> => {
  let paths: string[] = [];

  try {
    const files = req.files as multerTrackFiles;

    // check for files
    if (!files || Object.keys(files)?.length <= 4)
      throw new AppError("Missing track files.", 400, true);

    const trackBody = validateAndSanitizeBody(
      req.body,
      trackValidator.trackBodySchema
    );

    // upload files
    const trackFiles = await supabase.uploadTrackFiles(files);
    paths = bundleTrackFilesPath(trackFiles); // Save track files path for rollback incase of an error

    const newTrack = await trackService.createNewTrack({
      ...trackBody,
      ...trackFiles,
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

/* Get all tracks controller */
interface response extends ApiResponse<TrackInterface[]> {
  pagination: Pagination;
}

export const getTracks = async (
  req: Request<{}, ApiResponse<TrackInterface[]>, {}, Queries>,
  res: Response<response>,
  next: NextFunction
): Promise<void> => {
  try {
    const queries = validateAndSanitizeBody(
      req.query,
      trackValidator.trackQueriesSchema
    );

    const { tracks, pagination }: tracksResults = await trackService.getTracks(
      queries
    );

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

/* Get track controller */
export const getTrack = async (
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response<ApiResponse<TrackInterface>>,
  next: NextFunction
): Promise<void> => {
  try {
    const trackId = validateTrackidParam(req.params.id);

    const track: TrackInterface | null = await Track.findOne({
      _id: trackId,
    }).populate(
      "relatedTrack",
      "_id coverImageUrl title basicPrice premiumPrice description key type status bpm tags genre"
    );
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

/* Deactivate track controller */
export const deactivateTrack = async (
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response<ApiResponse<TrackInterface>>,
  next: NextFunction
): Promise<void> => {
  try {
    const trackId = validateTrackidParam(req.params.id);

    const track: TrackInterface | null = await Track.findOneAndUpdate(
      { _id: trackId },
      { $set: { status: "inactive" } },
      { new: true }
    );
    if (!track) throw new AppError("Track not found.", 404, true);
    logger.info("Track status was update to: inactive.", {
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

/* Activate track controller */
export const activateTrack = async (
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response<ApiResponse<TrackInterface>>,
  next: NextFunction
): Promise<void> => {
  try {
    const trackId = validateTrackidParam(req.params.id);

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
export const updateTrack = async (
  req: Request<{ id: string }, ApiResponse<TrackInterface>, TrackUpdates, {}>,
  res: Response<ApiResponse<TrackInterface>>,
  next: NextFunction
): Promise<void> => {
  let paths: string[] = [];

  try {
    const trackId = validateTrackidParam(req.params.id);
    const files = req.files as multerTrackFiles;

    const trackBody = validateAndSanitizeBody(
      req.body,
      trackValidator.trackUpdateBodySchema
    );

    // upload files if any
    const trackFiles = await supabase.uploadTrackFiles(files);
    paths = bundleTrackFilesPath(trackFiles); // Save track files path for rollback incase of an error

    const updatedTrack = await trackService.updateTrack(
      trackId,
      trackBody,
      trackFiles
    );

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
    logger.error("An error occur while downloading file from supabase", error);
    throw new AppError("Download error.", 500, true);
  }

  return data;
}

export const downloadTrackFile = async (
  req: Request<{ id: string }, {}, {}, { type: string; license: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const id = validateTrackidParam(req.params.id);
    const { type, license } = validateAndSanitizeBody(
      req.query,
      trackValidator.downloadQuerySchema
    );

    const { fileName, filePath } = await retriveTrackFilePaths(
      user,
      id,
      license,
      type
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
        id
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
