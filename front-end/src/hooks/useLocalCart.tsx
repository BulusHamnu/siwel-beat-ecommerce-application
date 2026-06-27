import { useState } from "react";
import { type CartItem } from "../pages/cart";
import type { Track } from "../components/trackCard";

interface LocalCart {
  items: CartItem[];
  subTotal: number;
}

const createProductSnapshot = (track: Track, license: string): CartItem => {
  return {
    name: track.title,
    productId: track._id,
    price: license === "premium" ? track.premiumPrice : track.basicPrice,
    license: license,
    type: track.type,
    status: "active",
    newPrice: null,
    track: {
      id: track._id,
      title: track.title,
      coverImageUrl: track.coverImageUrl,
      key: track.key,
      bpm: track.bpm,
      genre: track.genre,
    },
  };
};

const calculateSubTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    return total + item.price;
  }, 0);
};

/* Use LocalCart Hook */
function useLocalCart() {
  const [status, setStatus] = useState<
    "idle" | "success" | "product-exists" | "failed"
  >("idle");
  // const [data, setData] = useState<LocalCart | null>(null);

  const retrieveLocalCart = () => {
    const cartString = localStorage.getItem("localCart");

    if (!cartString) {
      return null;
    }

    const cart: LocalCart = JSON.parse(cartString);
    return cart;
  };

  const addTrackToLocalCart = (track: Track, license: "basic" | "premium") => {
    try {
      setStatus("idle");

      const cartString = localStorage.getItem("localCart");

      if (!cartString) {
        const localCart: LocalCart = {
          items: [],
          subTotal: 0,
        };

        const productSnapShot = createProductSnapshot(track, license);

        localCart.items.push(productSnapShot);
        localCart.subTotal = calculateSubTotal(localCart.items);

        const cart = JSON.stringify(localCart);
        localStorage.setItem("localCart", cart);

        return;
      } else {
        const localCart = JSON.parse(cartString);

        const productExists = localCart.items.find(
          (item: CartItem) =>
            item.productId === track._id && item.license === license,
        );

        if (productExists) {
          setStatus("product-exists");
          return;
        }

        const productSnapShot = createProductSnapshot(track, license);
        localCart.items.push(productSnapShot);

        localCart.subTotal = calculateSubTotal(localCart.items);

        const cart = JSON.stringify(localCart);
        localStorage.setItem("localCart", cart);
      }

      setStatus("success");
      //
    } catch (error) {
      console.log(error);
      setStatus("failed");
    }
  };

  return {
    status,
    retrieveLocalCart,
    addTrackToLocalCart,
  };
}

export default useLocalCart;
