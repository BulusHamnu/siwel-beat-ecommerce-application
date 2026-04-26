import Favourite, {
  type FavouriteInterface,
} from "../../models/favourite.schema.js";
import AppError, { ErrorCodes } from "../../errors/appError.js";
import Track, {
  StatusType,
  type TrackInterface,
} from "../../models/track.schema.js";
import type { ObjectId } from "mongoose";

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
        "Track already exists in favourites.",
        400,
        true,
        null,
      );

    throw error;
  }
};

/* Get favourites */
export interface PopulatedFavourite extends Omit<
  FavouriteInterface,
  "trackId"
> {
  trackId: {
    _id: ObjectId;
    coverImageUrl: string;
    title: string;
    basicPrice: number;
    premiumPrice: number;
    description: string;
    key: string;
    type: string;
    status: StatusType;
    bpm: number;
    tags: string[];
    genre: string;
  };
}

export const getFavourites = async (
  userId: string,
): Promise<PopulatedFavourite[]> => {
  const favourites = await Favourite.find({ userId })
    .populate({
      path: "trackId",
      select:
        "_id coverImageUrl title basicPrice premiumPrice description key type status bpm tags genre",
      match: { status: "published" },
    })
    .lean<PopulatedFavourite[]>();

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
