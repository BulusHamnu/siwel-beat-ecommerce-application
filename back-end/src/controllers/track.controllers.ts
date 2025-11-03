import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import {
  type Queries,
  type tracksResults,
  type Pagination,
} from "../services/track.services.js";
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
  type TrackUpdates,
} from "../services/track.services.js";
import { deleteFile } from "../middlewares/upload.js";
import logger from "../utils/logger.js";
import AppError from "../errors/appError.js";

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
