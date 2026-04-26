import type { Request, Response, NextFunction } from "express";
import { type ApiResponse } from "../responseInterface.js";
import * as favouriteServices from "../../services/users/userFavourites.service.js";
import * as userValidator from "../../utils/validators/user.validator.js";
import validateAndSanitizeBody from "../../utils/validators/validateAndSanitize.js";
import {
  mapFavourites,
  type FavouriteResponse,
} from "../../mappers/favourite.mappers.js";

/* Add to favourites */
export const addToMyFavourites = async (
  req: Request<{}, ApiResponse<void>, { trackId: string }, {}>,
  res: Response<ApiResponse<void>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user!;
    const { trackId } = validateAndSanitizeBody(
      req.body,
      userValidator.trackIdSchema,
    );

    await favouriteServices.addFavouriteTrack(user.id, trackId);

    const response: ApiResponse<void> = {
      status: true,
      message: "Track was added to favourites.",
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/* Get favourites */
export const getMyFavourites = async (
  req: Request<{}, ApiResponse<FavouriteResponse[]>, {}, {}>,
  res: Response<ApiResponse<FavouriteResponse[]>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user!;

    const favourites = await favouriteServices.getFavourites(user.id);
    const favouritesRes = mapFavourites(favourites);

    const response: ApiResponse<FavouriteResponse[]> = {
      status: true,
      message: "Favourites retrieved successfully.",
      data: favouritesRes,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Remove from favourites */
export const removeFromFavourites = async (
  req: Request<{}, ApiResponse<void>, { trackId: string }, {}>,
  res: Response<ApiResponse<void>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user!;
    const { trackId } = validateAndSanitizeBody(
      req.body,
      userValidator.trackIdSchema,
    );

    await favouriteServices.removeFromFavourites(trackId, user.id);
    const response: ApiResponse<void> = {
      status: true,
      message: "Track was removed successfully.",
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
