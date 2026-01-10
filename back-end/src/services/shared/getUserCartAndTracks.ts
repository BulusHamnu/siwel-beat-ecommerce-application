import Cart, { type CartInterface } from "../../models/cart.schema.js";
import Track, { type TrackInterface } from "../../models/track.schema.js";

export async function getCart(userId: string): Promise<CartInterface> {
  let userCart = await Cart.findOne({ userId });
  if (!userCart) userCart = await Cart.create({ userId });
  return userCart;
}

export default async function getUserCartandTracks(
  userId: string
): Promise<{ userCart: CartInterface; tracks: TrackInterface[] }> {
  const userCart = await getCart(userId);
  if (userCart.items.length <= 0) return { userCart, tracks: [] };

  const productIds = userCart.items.map((item) => item.productId);
  const tracks = await Track.find({ _id: { $in: productIds } }).lean<
    TrackInterface[]
  >();

  return { userCart, tracks };
}
