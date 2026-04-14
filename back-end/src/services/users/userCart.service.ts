import Track, { type TrackInterface } from "../../models/track.schema.js";
import AppError, { ErrorCodes } from "../../errors/appError.js";
import Cart, {
  type CartItem,
  ItemStatus,
  type CartInterface,
} from "../../models/cart.schema.js";
import { type ObjectId } from "mongoose";
import mongoose, { Types } from "mongoose";

/* Add to cart */
export const addToCart = async (
  trackId: string,
  license: string,
  userId: string | ObjectId,
): Promise<void> => {
  const track: TrackInterface | null = await Track.findOne({ _id: trackId });
  if (!track)
    throw new AppError(
      ErrorCodes.TRACK_NOT_FOUND,
      "Track not found.",
      404,
      true,
      null,
    );

  try {
    await Cart.create({ userId });
  } catch (error: any) {
    if (error.code !== 11000) throw error;
  }

  const productSnapShop: CartItem = {
    name: track.title,
    productId: track._id as ObjectId,
    license,
    price: license === "premium" ? track.premiumPrice : track.basicPrice,
    type: track.type,
  };

  const updated = await Cart.updateOne(
    {
      userId,
      items: {
        $not: {
          $elemMatch: {
            productId: track._id,
            license: license,
          },
        },
      },
    },
    {
      $push: { items: productSnapShop },
    },
  );

  if (updated.modifiedCount === 0 || updated.matchedCount === 0) {
    throw new AppError(
      ErrorCodes.PRODUCT_ALREADY_EXISTS,
      "Product already exists in cart.",
      400,
      true,
      null,
    );
  }
};

/* Remove from cart */
export const removeFromCart = async (
  trackId: string,
  license: string,
  userId: string,
): Promise<void> => {
  const updated = await Cart.updateOne(
    { userId },
    { $pull: { items: { productId: trackId, license } } },
  );

  if (updated.matchedCount === 0)
    throw new AppError(
      ErrorCodes.CART_NOT_FOUND,
      "Cart not found.",
      404,
      true,
      null,
    );

  if (updated.modifiedCount === 0)
    throw new AppError(
      ErrorCodes.PRODUCT_NOT_FOUND,
      "Product does not exists in cart.",
      400,
      true,
      null,
    );

  console.log(updated);
};

/* Get user cart */
interface CartItemUpdated extends CartItem {
  status?: ItemStatus;
  newPrice?: number;
}

function validateItemsStatus(
  cartItems: CartItem[],
  trackMap: Map<string, any>,
): void {
  cartItems.forEach((product: CartItemUpdated) => {
    const track = trackMap.get(String(product.productId));

    if (!track) {
      product.status = ItemStatus.deleted;
    } else if (track.status !== "published") {
      product.status = ItemStatus.inactive;
    } else if (
      (product.license === "basic" && track.basicPrice !== product.price) ||
      (product.license === "premium" && track.premiumPrice !== product.price)
    ) {
      product.status = ItemStatus.priceChanged;
      product.newPrice =
        product.license === "basic" ? track.basicPrice : track.premiumPrice;
    } else {
      product.status = ItemStatus.active;
    }

    //
  });
}

export async function retrieveCart(userId: string): Promise<CartInterface> {
  let userCart = await Cart.findOne({ userId }).lean<CartInterface>();
  if (!userCart)
    throw new AppError(
      ErrorCodes.CART_NOT_FOUND,
      "Cart not found.",
      404,
      true,
      null,
    );

  return userCart;
}

export const getUserCart = async (userId: string): Promise<CartInterface> => {
  const cart = await retrieveCart(userId);
  if (cart.items.length <= 0) return cart;

  const productIds = cart.items.map((item) => item.productId);
  const tracks = await Track.find({ _id: { $in: productIds } }).lean<
    TrackInterface[]
  >();

  const trackMap = new Map<string, any>();
  tracks.forEach((track) => {
    trackMap.set(String(track._id), track);
  });

  validateItemsStatus(cart.items, trackMap); // User should know if product status or price has changed
  const subTotal = cart.items.reduce(
    (sum, item) => sum + Number(item.price),
    0,
  );

  cart.subTotal = subTotal;
  return cart;
};
