import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import {
  type Queries,
  type tracksResults,
  type Pagination,
} from "../services/track.services.js";
import Track, {
  type TrackInterface,
  type createTrackBody,
} from "../models/track.schema.js";
import { createNewTrack, getTracks } from "../services/track.services.js";
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

    const files = req.files as any;

    const newTrack = await createNewTrack({
      title,
      description,
      type: type.toLowerCase(),
      key,
      bpm,
      tags,
      price,
      genre: genre.toLowerCase(),
      taggedFileUrl: files.taggedBeat[0].path,
      unTaggedFileUrl: files.untaggedBeat[0].path,
      basicLicenseUrl: files.basicLicense[0].path,
      premiumLicenseUrl: files.premiumLicense[0].path,
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

// GET TRACK
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
