import Favourite, {
  type FavouriteInterface,
} from "../../models/favourite.schema.js";
import AppError from "../../errors/appError.js";
import Track from "../../models/track.schema.js";

/* Add to favourites */
const addFavouriteTrack = async (
  userId: string,
  trackId: string
): Promise<void> => {
  const track = await Track.findOne({ _id: trackId });
  if (!track) throw new AppError("Track not found", 404, true);

  const favourite = await Favourite.findOne({ trackId, userId });
  if (favourite)
    throw new AppError("Track is already in the favourites list.", 400, true);

  await Favourite.create({ userId, trackId });
};

/* Get favourites */
const getFavourites = async (userId: string): Promise<FavouriteInterface[]> => {
  const favourites = await Favourite.find({ userId }).populate(
    "trackId",
    "relatedTrack genre tags bpm status key type description price title _id"
  );

  return favourites;
};

/* Remove from favourites */
const removeFromFavourites = async (
  trackId: string,
  userId: string
): Promise<void> => {
  await Favourite.findOneAndDelete({ trackId, userId });
};

export default { addFavouriteTrack, getFavourites, removeFromFavourites };
