import type { StatusType } from "../models/track.schema.js";
import type { PopulatedFavourite } from "../services/users/userFavourites.service.js";

export interface FavouriteResponse {
  id: string;
  coverImageUrl: string;
  title: string;
  basicPrice: number;
  premiumPrice: number;
  description: string;
  type: string;
  key: string;
  status: StatusType;
  bpm: number;
  tags: string[];
  genre: string;
}

/* Favourites response mapper */
export function toFavouriteRes(
  favourite: PopulatedFavourite,
): FavouriteResponse {
  const track = favourite.trackId;

  return {
    id: String(track?._id),
    coverImageUrl: track?.coverImageUrl,
    title: track?.title,
    basicPrice: track?.basicPrice,
    premiumPrice: track?.premiumPrice,
    description: track?.description,
    type: track?.type,
    key: track?.key,
    status: track?.status,
    bpm: track?.bpm,
    tags: track?.tags,
    genre: track?.genre,
  };
}

export function toFavouritesRes(
  favourites: PopulatedFavourite[],
): FavouriteResponse[] {
  return favourites.map((favourite) => {
    return toFavouriteRes(favourite);
  });
}
