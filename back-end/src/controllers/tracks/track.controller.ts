import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "../responseInterface.js";
import Track, { type TrackInterface } from "../../models/track.schema.js";
import type { tracksResults } from "../../services/tracks/track.service.js";
import * as trackService from "../../services/tracks/track.service.js";
import { retrieveTrackFileForDownload } from "../../services/tracks/downloadTrackFile.service.js";
import { type Pagination } from "../responseInterface.js";
import logger from "../../utils/logger.js";
import supabase, { type uploadedTrackFiles } from "../../services/supabase.js";
import { Readable } from "stream";
import { fileTypeFromBlob } from "file-type";
import * as notificationService from "../../services/notification.service.js";
import * as trackValidator from "../../utils/validators/track.validator.js";
import validateAndSanitizeBody from "../../utils/validators/validateAndSanitize.js";
import {
  type createTrackInput,
  type TrackMedia,
} from "../../services/tracks/track.service.js";
import { validateTrackidParam } from "../../utils/validators/track.validator.js";
import type { MulterTrackFiles } from "../../middlewares/upload.js";
import Audio from "../../models/audio.schema.js";

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

function getStatusQueryCondition(userRole: string | undefined) {
  if (userRole && userRole === "admin") {
    return { $in: ["published", "draft", "unpublished"] };
  } else {
    return { $in: ["published"] };
  }
}

export const getTracks = async (
  req: Request<{}, ApiResponse<TrackInterface[]>, {}>,
  res: Response<response>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userRole = req.user?.role;

    const queries = validateAndSanitizeBody(
      req.query,
      trackValidator.trackQueriesSchema,
    );

    const status = getStatusQueryCondition(userRole);
    const { tracks, pagination }: tracksResults = await trackService.getTracks({
      ...queries,
      status,
    });

    const response: response = {
      status: true,
      message: "Tracks retrieved sucessfully.",
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
    const userRole = req.user?.role;
    const trackId = validateTrackidParam(req.params.id);

    const status = getStatusQueryCondition(userRole);
    const track = await trackService.getSingleTrack(trackId, status);

    const response: ApiResponse<TrackInterface> = {
      status: true,
      message: "Track retrieved sucessfully.",
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

/* Unpublish track handler */
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

/* Retrieve track files */
export async function retrieveTrackMedia(
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response<ApiResponse<TrackMedia>>,
  next: NextFunction,
) {
  try {
    const trackId = req.params.id;

    const data = await trackService.retrieveTrackMedia(trackId);
    const response: ApiResponse<trackService.TrackMedia> = {
      status: true,
      message: "Track files retrieved successfully.",
      data: data,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

/* Download track files */
export const downloadTrackFile = async (
  req: Request<{ id: string }, {}, {}, { type: string; license: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user!;
    const trackId = validateTrackidParam(req.params.id);
    const { type, license } = validateAndSanitizeBody(
      req.query,
      trackValidator.downloadQuerySchema,
    );

    const { downloadUrl } = await retrieveTrackFileForDownload({
      user,
      trackId,
      licenseType: license,
      requestedFile: type,
    });

    await notificationService.postNewNotification(
      user.id,
      "Your download is ready.",
      "DOWNLOAD_STARTED",
      trackId,
    );

    res.status(200).json({ downloadUrl });
  } catch (error) {
    next(error);
  }
};

/* Stream track handler */
export const streamTrackAudio = async (
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const { id } = req.params;

    const range = req.headers["range"]; //?.split("=")[1];
    if (!range) return res.status(500);

    const audio = await Audio.findOne({ trackId: id });
    const filePath = audio?.untagged;

    if (!filePath) return res.status(404);

    const { data, error } = await supabase.client
      .from("audios")
      .createSignedUrl(filePath, 60);

    if (error) {
      logger.error("An error occurred while streaming the audio file.", error);
      return res.status(500);
    }

    const url = data.signedUrl;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Range: range,
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
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    const stream = Readable.fromWeb(response.body as any); // change res web buffer to node streamable
    res.status(response.status);
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};
