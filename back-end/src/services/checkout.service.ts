import AppError, { ErrorCodes } from "../errors/appError.js";
import { type CartItem, type CartInterface } from "../models/cart.schema.js";
import { retrieveCart } from "./users/userCart.service.js";
import Track, { type TrackInterface } from "../models/track.schema.js";
import { createOrder } from "./shared/ordersShared.service.js";

/* Get checkout summary */
function validateProductsStatus(
  cartItems: CartItem[],
  trackMap: Map<string, any>,
) {
  cartItems.forEach((item) => {
    const track = trackMap.get(String(item.productId));
    if (!track || track.status !== "published") {
      throw new AppError(
        ErrorCodes.CART_INVALID,
        "Some items in your cart are invalid, please confirm and update cart.",
        400,
        true,
        null,
      );
    } else if (
      (item.license === "basic" && track.basicPrice !== item.price) ||
      (item.license === "premium" && track.premiumPrice !== item.price)
    ) {
      throw new AppError(
        ErrorCodes.CART_INVALID,
        `An item price in your cart has changed. Update your cart.`,
        400,
        true,
        { item: item.name },
      );
    }
  });
}

export interface CheckoutItem {
  productId: string;
  license: string;
}

export const createCheckout = async (
  userId: string,
  items: CheckoutItem[],
): Promise<string> => {
  const userCart = await retrieveCart(userId);
  const cartItems = userCart.items;

  const selectedItems = cartItems.filter((product) => {
    for (const item of items) {
      return (
        item.productId === String(product.productId) &&
        item.license === product.license
      );
    }
  });

  if (selectedItems.length <= 0)
    throw new AppError(
      ErrorCodes.CHECKOUT_ERROR,
      "No items selected.",
      400,
      true,
      null,
    );

  const productIds = selectedItems.map((item) => item.productId);
  const tracks = await Track.find({ _id: { $in: productIds } }).lean<
    TrackInterface[]
  >();

  const trackMap = new Map<string, any>();
  tracks.forEach((track) => {
    trackMap.set(String(track._id), track);
  });

  validateProductsStatus(selectedItems, trackMap); // Items have to be valid for checkout

  await createOrder(selectedItems);

  return "url_not_available";
};
