import type { Request, Response, NextFunction } from "express";
import { type ApiResponse } from "../responseInterface.js";
import favouriteServices from "../../services/users/userFavourites.service.js";
import { type FavouriteInterface } from "../../models/favourite.schema.js";
import * as userValidator from "../../utils/validators/user.validator.js";
import validateAndSanitizeBody from "../../utils/validators/validateAndSanitize.js";

/* Add to favourites controller */
const addToUserFavourites = async (
  req: Request<{}, ApiResponse<void>, { trackId: string }, {}>,
  res: Response<ApiResponse<void>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { trackId } = validateAndSanitizeBody(
      req.body,
      userValidator.trackIdSchema
    );

    await favouriteServices.addFavouriteTrack(user.id, trackId);

    const response: ApiResponse<void> = {
      status: true,
      message: "Track was added to favourites list successfully.",
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/* Get favourites controller */
const getUserFavourites = async (
  req: Request<{}, ApiResponse<FavouriteInterface[]>, {}, {}>,
  res: Response<ApiResponse<FavouriteInterface[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;

    const favourites = await favouriteServices.getFavourites(user.id);
    const response: ApiResponse<FavouriteInterface[]> = {
      status: true,
      message: "Favourite tracks retrived successfully.",
      data: favourites,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Remove from favourites controller */
const removeFromFavouritesController = async (
  req: Request<{}, ApiResponse<void>, { trackId: string }, {}>,
  res: Response<ApiResponse<void>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { trackId } = validateAndSanitizeBody(
      req.body,
      userValidator.trackIdSchema
    );

    await favouriteServices.removeFromFavourites(trackId, user.id);
    const response: ApiResponse<void> = {
      status: true,
      message: "Track was removed succefully.",
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export default {
  addToUserFavourites,
  getUserFavourites,
  removeFromFavouritesController,
};
