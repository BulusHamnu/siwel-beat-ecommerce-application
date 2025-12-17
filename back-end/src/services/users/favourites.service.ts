import Favourite, {
  type FavouriteInterface,
} from "../../models/favourite.schema.js";
import AppError from "../../errors/appError.js";

/* Add to favourites */
export const addFavouriteTrack = async (
  userId: string,
  trackId: string
): Promise<void> => {
  const favourite = await Favourite.findOne({ trackId, userId });
  if (favourite)
    throw new AppError("Track is already in the favourites list.", 400, true);

  await Favourite.create({ userId, trackId });
};

/* Get favourites */
export const getFavourites = async (
  userId: string
): Promise<FavouriteInterface[]> => {
  const favourites = await Favourite.find({ userId }).populate(
    "trackId",
    "relatedTrack genre tags bpm status key type description price title _id"
  );

  return favourites;
};

/* Remove from favourites */
export const removeFromFavourites = async (
  trackId: string,
  userId: string
): Promise<void> => {
  await Favourite.findOneAndDelete({ trackId, userId });
};
