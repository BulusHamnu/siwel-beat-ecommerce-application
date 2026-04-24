import Track, { type TrackInterface } from "../../models/track.schema.js";
import AppError, { ErrorCodes } from "../../errors/appError.js";
import Cart, {
  type CartItem,
  ItemStatus,
  type CartInterface,
} from "../../models/cart.schema.js";
import { type ObjectId } from "mongoose";

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
};

/* Get user cart */
export interface PopulatedCartItem extends Omit<CartItem, "productId"> {
  productId: {
    _id: string | ObjectId;
    coverImageUrl: string;
    title: string;
    basicPrice: number;
    premiumPrice: number;
    description: string;
    key: string;
    status: string;
    bpm: number;
    genre: string;
  };
  status?: ItemStatus;
  newPrice?: number;
}

export interface PopulatedCart extends Omit<CartInterface, "items"> {
  items: PopulatedCartItem[];
}

function validateItemsStatus(cartItems: PopulatedCartItem[]): void {
  cartItems.forEach((item: PopulatedCartItem) => {
    const track = item.productId; // Contains populated track details

    if (!track) {
      item.status = ItemStatus.deleted;
    } else if (track.status !== "published") {
      item.status = ItemStatus.inactive;
    } else if (
      (item.license === "basic" && track.basicPrice !== item.price) ||
      (item.license === "premium" && track.premiumPrice !== item.price)
    ) {
      item.status = ItemStatus.priceChanged;
      item.newPrice =
        item.license === "basic" ? track.basicPrice : track.premiumPrice;
    } else {
      item.status = ItemStatus.active;
    }
  });
}

export async function retrieveCart(userId: string) {
  const cart = await Cart.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        items: [],
      },
    },
    {
      upsert: true,
      new: true,
    },
  )
    .populate(
      "items.productId",
      "_id coverImageUrl title basicPrice premiumPrice description key status bpm genre",
    )
    .lean<PopulatedCart>();

  return cart;
}

export const getUserCart = async (userId: string): Promise<PopulatedCart> => {
  const cart = await retrieveCart(userId);
  if (cart.items.length <= 0) return cart;

  validateItemsStatus(cart.items); // User should know if product status or price has changed
  const subTotal = cart.items.reduce(
    (sum, item) => sum + Number(item.price),
    0,
  );

  cart.subTotal = subTotal;
  return cart;
};
