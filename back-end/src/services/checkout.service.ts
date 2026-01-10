import AppError from "../errors/appError.js";
import { type CartItem, type CartInterface } from "../models/cart.schema.js";
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
  userId: string,
  items: string[]
): Promise<checkoutSummary> => {
  const { userCart, tracks } = await getUserCartandTracks(userId);
  const userCartObj: CartInterface = userCart.toObject();

  // Filter selected items
  const selectedItems = userCartObj.items.filter((item) =>
    items.includes(String(item.productId))
  );

  const trackMap = new Map<string, any>();
  tracks.forEach((track) => {
    trackMap.set(String(track._id), track);
  });
  verifyItemsStatus(trackMap, selectedItems); // Items have to be valid for checkout

  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + Number(item.price),
    0
  );

  return { items: selectedItems, total: totalAmount };
};
