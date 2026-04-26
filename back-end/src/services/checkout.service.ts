import AppError, { ErrorCodes } from "../errors/appError.js";
import {
  retrieveCart,
  type PopulatedCartItem,
} from "./users/userCart.service.js";
import { createOrder } from "./shared/ordersShared.service.js";
import logger from "../utils/logger.js";

/* Checkout */
function validateProductsStatus(cartItems: PopulatedCartItem[]) {
  cartItems.forEach((item) => {
    const track = item.productId; // Because the productId is populated with the track data

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

    logger.info("User's cart items are valid, procedding to create order.");
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
        item.productId === String(product.productId._id) &&
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

  validateProductsStatus(selectedItems); // Items have to be valid for checkout
  await createOrder(selectedItems);

  return "url_not_available";
};
