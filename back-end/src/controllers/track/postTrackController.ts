import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "../apiTypes.js";
import {
  type TrackInterface,
  type createTrackBody,
} from "../../models/trackModel.js";
import createNewTrack from "../../services/createNewTrack.js";
import { deleteFile } from "../../middlewares/upload.js";
import logger from "../../utils/logger.js";

const postTrackController = async (
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

export default postTrackController;
