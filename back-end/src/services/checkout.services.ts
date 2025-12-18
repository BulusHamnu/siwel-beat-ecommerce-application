import AppError from "../errors/appError.js";
import { type CartItem } from "../models/profile.schema.js";
import getUserCartandTracks from "./shared/getUserCartAndTracks.js";

export interface checkoutSummary {
  total: number;
  items: CartItem[];
}

/* Get checkout summary */
function verifyItemsStatus(trackMap: Map<string, any>, cartItems: CartItem[]) {
  cartItems.forEach((item) => {
    const track = trackMap.get(String(item.productId));
    if (!track || track.status !== "active") {
      throw new AppError(
        "Some items in your cart are invalid, please confirm and update cart.",
        400,
        true
      );
    } else if (
      (item.license === "basic" && track.basicPrice !== item.price) ||
      (item.license === "premium" && track.premiumPrice !== item.price)
    ) {
      throw new AppError(
        `Price for ${item.name} has changed. Update your cart.`,
        400,
        true
      );
    }
  });
}

export const getCheckoutSummary = async (
  userId: string
): Promise<checkoutSummary> => {
  // Items have to be valid for checkout
  const { cart, tracks } = await getUserCartandTracks(userId);

  const trackMap = new Map<string, any>();
  tracks.forEach((track) => {
    trackMap.set(track._id.toString(), track);
  });

  verifyItemsStatus(trackMap, cart);
  const totalAmount = cart.reduce((sum, item) => sum + Number(item.price), 0);

  return { items: cart, total: totalAmount };
};
