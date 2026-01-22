import Track, { type TrackInterface } from "../../models/track.schema.js";
import AppError from "../../errors/appError.js";
import Cart, {
  type CartItem,
  ItemStatus,
  type CartInterface,
} from "../../models/cart.schema.js";
import { type ObjectId } from "mongoose";
import getUserCartandTracks from "../shared/getUserCartAndTracks.js";
import { getCart } from "../shared/getUserCartAndTracks.js";

/* Add to cart */
export const addToCart = async (
  trackId: string,
  license: string,
  userId: string
): Promise<void> => {
  const userCart = await getCart(userId);

  const track: TrackInterface | null = await Track.findOne({ _id: trackId });
  if (!track) throw new AppError("Track not found", 404, true);

  // check if product is already in cart to avoid duplicate
  const productExist = userCart.items.find(
    (track) =>
      String(track.productId) === String(trackId) && license === track.license
  );
  if (productExist)
    throw new AppError("Product already exist in cart.", 400, true);

  const productSnapShop: CartItem = {
    name: track.title,
    productId: track._id as ObjectId,
    license,
    price: license === "basic" ? track.basicPrice : track.premiumPrice,
    type: track.type,
  };

  userCart.items.push(productSnapShop);
  await userCart.save();
};

/* Remove from cart */
export const removeFromCart = async (
  trackId: string,
  license: string,
  userId: string
): Promise<void> => {
  await Cart.findOneAndUpdate(
    { userId },
    { $pull: { items: { productId: trackId, license } } },
    { new: true }
  );
};

/* Get user cart */
interface CartItemUpdated extends CartItem {
  status?: ItemStatus;
  newPrice?: number;
}

function validateProductsStatus(
  cartItems: CartItem[],
  trackMap: Map<string, any>
): void {
  cartItems.forEach((product: CartItemUpdated) => {
    const track = trackMap.get(String(product.productId));

    if (!track) {
      product.status = ItemStatus.deleted;
    } else if (track.status !== "active") {
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
  });
}

export const getUserCart = async (userId: string): Promise<CartInterface> => {
  const { userCart, tracks } = await getUserCartandTracks(userId);
  const userCartObj: CartInterface = userCart.toObject(); // So we can add new fields to item objects

  if (userCartObj.items.length <= 0 && tracks.length <= 0) return userCart;

  const trackMap = new Map<string, any>();
  tracks.forEach((track) => {
    trackMap.set(String(track._id), track);
  });

  validateProductsStatus(userCartObj.items, trackMap); // User should know if product status or price has changed
  const subTotal = userCartObj.items.reduce(
    (sum, item) => sum + Number(item.price),
    0
  );

  userCartObj.subTotal = subTotal;
  return userCartObj;
};
