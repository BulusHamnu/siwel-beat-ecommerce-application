import type { CartItem, ItemStatus } from "../models/cart.schema.js";
import type { PopulatedCart } from "../services/users/userCart.service.js";

interface CartTrackSnapshot {
  id: string;
  title: string;
  coverImageUrl: string;
  key: string;
  bpm: number;
  genre: string;
}

interface ModifiedCartItem extends Omit<CartItem, "productId"> {
  productId: string;
  status: ItemStatus | undefined;
  newPrice: number | null;
  track: CartTrackSnapshot;
}

export interface CartResponse {
  items: ModifiedCartItem[];
  subTotal: number;
  createdAt: Date;
}

/*  Cart mapper */
export function toCartResponse(cart: PopulatedCart): CartResponse {
  let cartItems: ModifiedCartItem[] = [];

  if (cart.items.length > 0) {
    cartItems = cart.items.map((item) => {
      const track = item.productId;

      return {
        name: item.name,
        productId: String(track?._id),
        price: item.price,
        license: item.license,
        type: item.type,
        status: item.status,
        newPrice: item.newPrice || null,
        track: {
          id: String(track?._id),
          title: track?.title,
          coverImageUrl: track?.coverImageUrl,
          key: track?.key,
          bpm: track?.bpm,
          genre: track?.genre,
        },
      };
    });
  }

  return {
    items: cartItems,
    subTotal: cart.subTotal!,
    createdAt: cart.createdAt,
  };
}
