import Favourite, {
  type FavouriteInterface,
} from "../../models/favourite.schema.js";
import AppError, { ErrorCodes } from "../../errors/appError.js";
import Track from "../../models/track.schema.js";

/* Add to favourites */
const addFavouriteTrack = async (
  userId: string,
  trackId: string,
): Promise<void> => {
  const track = await Track.findOne({ _id: trackId });
  if (!track)
    throw new AppError(
      ErrorCodes.TRACK_NOT_FOUND,
      "Track not found",
      404,
      true,
      null,
    );

  const favourite = await Favourite.findOne({ trackId, userId });
  if (favourite)
    throw new AppError(
      ErrorCodes.TRACK_ALREADY_EXISTS,
      "Track already exists in the favourites list.",
      400,
      true,
      null,
    );

  await Favourite.create({ userId, trackId });
};

/* Get favourites */
const getFavourites = async (userId: string): Promise<FavouriteInterface[]> => {
  const favourites = await Favourite.find({ userId }).populate(
    "trackId",
    "relatedTrack genre tags bpm status key type description price title _id",
  );

  return favourites;
};

/* Remove from favourites */
const removeFromFavourites = async (
  trackId: string,
  userId: string,
): Promise<void> => {
  await Favourite.findOneAndDelete({ trackId, userId });
};

export default { addFavouriteTrack, getFavourites, removeFromFavourites };
