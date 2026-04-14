import Favourite, {
  type FavouriteInterface,
} from "../../models/favourite.schema.js";
import AppError, { ErrorCodes } from "../../errors/appError.js";
import Track, { type TrackInterface } from "../../models/track.schema.js";

/* Add to favourites */
export const addFavouriteTrack = async (
  userId: string,
  trackId: string,
): Promise<void> => {
  const track = await Track.findOne({ _id: trackId }).lean<TrackInterface>();
  if (!track)
    throw new AppError(
      ErrorCodes.TRACK_NOT_FOUND,
      "Track not found",
      404,
      true,
      null,
    );

  try {
    await Favourite.create({ userId, trackId });
  } catch (error: any) {
    if (error.code === 11000)
      throw new AppError(
        ErrorCodes.FAVOURITE_ALREADY_EXISTS,
        "Track already exists in the favourites.",
        400,
        true,
        null,
      );

    throw error;
  }
};

/* Get favourites */
export const getFavourites = async (
  userId: string,
): Promise<FavouriteInterface[]> => {
  const favourites = await Favourite.find({ userId }).populate(
    "trackId",
    "genre tags bpm status key type description price title _id",
  );

  return favourites;
};

/* Remove from favourites */
export const removeFromFavourites = async (
  trackId: string,
  userId: string,
): Promise<void> => {
  const deleted = await Favourite.findOneAndDelete({ trackId, userId });

  if (!deleted)
    throw new AppError(
      ErrorCodes.FAVOURITE_NOT_FOUND,
      "Track is not in your favourites.",
      404,
      true,
      null,
    );
};
