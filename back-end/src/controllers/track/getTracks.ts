import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "../apiTypes.js";
import AppError from "../../errors/appError.js";
import getTracks, {
  type Queries,
  type tracksResults,
  type Pagination,
} from "../../services/getTracks.js";
import type { TrackInterface } from "../../models/trackModel.js";

interface response extends ApiResponse<TrackInterface[]> {
  pagination: Pagination;
}

const getTrackController = async (
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

export default getTrackController;
