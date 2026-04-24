import type { ItemStatus } from "../models/cart.schema.js";
import type { PopulatedCart } from "../services/users/userCart.service.js";

interface CartTrackSnapshot {
  id: string;
  title: string;
  coverImageUrl: string;
  key: string;
  bpm: number;
  genre: string;
}

interface ModifiedCartItem {
  name: string;
  productId: string;
  price: number;
  license: string;
  type: string;
  status: ItemStatus | undefined;
  newPrice: number | null;
  track: CartTrackSnapshot;
}

export interface CartResponse {
  //   userId: string;
  items: ModifiedCartItem[];
  subTotal: number;
  createdAt: Date;
}

/*  Cart mapper */
export function mapCartResponse(cart: PopulatedCart): CartResponse {
  let cartItems: ModifiedCartItem[] = [];

  if (cart.items.length > 0) {
    cartItems = cart.items.map((item) => {
      return {
        name: item.name,
        productId: String(item.productId._id),
        price: item.price,
        license: item.license,
        type: item.type,
        status: item.status,
        newPrice: item.newPrice || null,
        track: {
          id: String(item.productId._id),
          title: item.productId.title,
          coverImageUrl: item.productId.coverImageUrl,
          key: item.productId.key,
          bpm: item.productId.bpm,
          genre: item.productId.genre,
        },
      };
    });
  }

  return {
    // userId: String(cart.userId),
    items: cartItems,
    subTotal: cart.subTotal!,
    createdAt: cart.createdAt,
  };
}
