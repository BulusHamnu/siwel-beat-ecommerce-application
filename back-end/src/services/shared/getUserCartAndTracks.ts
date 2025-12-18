import { type CartItem } from "../../models/profile.schema.js";
import Profile from "../../models/profile.schema.js";
import AppError from "../../errors/appError.js";
import Track from "../../models/track.schema.js";

export default async function getUserCartandTracks(
  userId: string
): Promise<{ cart: CartItem[]; tracks: any[] }> {
  const profile = await Profile.findOne({ userId });
  if (!profile) throw new AppError("Profile not found.", 404, true);

  const profileObj = profile.toObject();
  const cart: CartItem[] = profileObj.cart;
  const productIds = cart.map((item) => item.productId);

  const tracks = await Track.find({ _id: { $in: productIds } }).lean();
  return { cart, tracks };
}
