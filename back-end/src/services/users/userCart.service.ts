import Track, { type TrackInterface } from "../../models/track.schema.js";
import AppError from "../../errors/appError.js";
import Profile, {
  type ProfileInterface,
  type CartItem,
} from "../../models/profile.schema.js";
import mongoose from "mongoose";
import getUserCartandTracks from "../shared/getUserCartAndTracks.js";

/* Add to cart */
export const addToCart = async (
  trackId: string,
  license: string,
  userId: string
): Promise<void> => {
  const track: TrackInterface | null = await Track.findOne({ _id: trackId });
  if (!track) throw new AppError("Track not found", 404, true);

  const userProfile: ProfileInterface | null = await Profile.findOne({
    userId,
  });
  // check if product is already in cart, there should be no duplilate in cart
  const productExist = userProfile?.cart.find(
    (track) =>
      String(track.productId) === String(trackId) && license === track.license
  );

  if (productExist)
    throw new AppError("Product already exist in cart.", 400, true);

  const product: CartItem = {
    name: track.title,
    productId: track._id as any,
    license,
    price: license === "basic" ? track.basicPrice : track.premiumPrice,
    type: track.type,
  };

  userProfile?.cart.push(product);
  await userProfile?.save();
};

/* Remove from cart */
export const removeFromCart = async (
  trackId: string,
  license: string,
  userId: string
): Promise<void> => {
  const track: TrackInterface | null = await Track.findOne({ _id: trackId });

  if (!track) throw new AppError("Track not found", 404, true);

  const id = new mongoose.Types.ObjectId(trackId); // change track id to object id
  await Profile.findOneAndUpdate(
    { userId },
    { $pull: { cart: { productId: id, license } } },
    { new: true }
  );
};

/* Get user cart */
interface CartItemUpdated extends CartItem {
  status?: "deleted" | "in-active" | "price_changed" | "active";
  newPrice?: number;
}

function validateProductsStatus(
  cart: CartItem[],
  trackMap: Map<string, any>
): void {
  cart.forEach((product: CartItemUpdated) => {
    const track = trackMap.get(String(product.productId));
    if (!track) {
      product.status = "deleted";
    } else if (track.status !== "active") {
      product.status = "in-active";
    } else if (
      (product.license === "basic" && track.basicPrice !== product.price) ||
      (product.license === "premium" && track.premiumPrice !== product.price)
    ) {
      product.status = "price_changed";
      product.newPrice =
        product.license === "basic" ? track.basicPrice : track.premiumPrice;
    } else {
      product.status = "active";
    }
  });
}

export const getUserCart = async (userId: string): Promise<CartItem[]> => {
  const { cart, tracks } = await getUserCartandTracks(userId);
  const trackMap = new Map<string, any>();
  tracks.forEach((track) => {
    trackMap.set(track._id.toString(), track);
  });

  // User should know if product status or price has changed
  validateProductsStatus(cart, trackMap);
  return cart;
};
