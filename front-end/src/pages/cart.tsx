import { ChevronDown, Play, Pause } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { formatAmount } from "../helpers/helpers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import callApi from "../lib/callApi";
import CartProductSkeleton from "../components/cartProductSkeleton";
import toast from "react-hot-toast";
import usePlayer from "../hooks/usePlayer";
import Header from "../components/header";
import Footer from "../components/footer";
import useAuth from "../hooks/useAuth";
import useLocalCart from "../hooks/useLocalCart";
import { MoonLoader } from "react-spinners";

export interface CartItem {
  name: string;
  productId: string;
  price: number;
  license: string;
  type: string;
  status: "active" | "inactive" | "price_changed";
  newPrice: number | null;
  track: {
    id: string;
    title: string;
    coverImageUrl: string;
    key: string;
    bpm: number;
    genre: string;
  };
}

interface Cart {
  items: CartItem[];
  subTotal: number;
}

interface SelectedItem {
  productId: string;
  license: string;
}

/* Cart Summary */
function CartSummary({
  products,
  cartTotal,
}: {
  products: SelectedItem[];
  cartTotal: number;
}) {
  const [isOpen] = useState(false); //setIsOpen
  const { isAutheticated } = useAuth();

  const { mutate: checkOut, isPending } = useMutation({
    mutationFn: async (data: SelectedItem[]) => {
      const res = await callApi<{ url: string }>({
        endpoint: "/checkouts",
        method: "post",
        body: {
          items: data,
        },
      });

      return res.data;
    },
    onSuccess: (data) => {
      // This will not run because checkout has not been implemented yet.
      console.log(data);
    },
    onError: (err: any) => {
      const errCode = err.response.data?.error.code;

      switch (errCode) {
        case "CHECKOUT_ERROR": {
          toast.error("Nothing selected! Pick at least one item to checkout.", {
            duration: 3000,
            id: "no-items-selected",
            position: "top-center",
          });
          break;
        }

        case "CART_INVALID": {
          const msg = err.response.data.message;
          toast.error(msg, {
            duration: 3000,
            id: "items-invalid",
            position: "top-center",
          });
          break;
        }

        case "NOT_IMPLEMENTED": {
          toast.error("Checkout is not available yet.", {
            duration: 3000,
            id: "checkout-not-available",
            position: "top-center",
          });
          break;
        }

        default: {
          toast.error(
            "An error occurred during checkout. Please try again later.",
            {
              duration: 3000,
              id: "checkout-failed",
              position: "top-center",
            },
          );
        }
      }
    },
  });

  return (
    <div className="bg-[#04254D] p-4 pb-8  h-fit">
      <h2 className="text-left">Cart Summary</h2>
      <div className="flex flex-row justify-between items-center mt-3">
        <span className="font-bold text-lg">Total</span>
        <span className="text-xl">{formatAmount(cartTotal)}</span>
      </div>
      <div className="mt-7">
        <div
          // onClick={() => setIsOpen(!isOpen)}
          className="flex flex-row flex-nowrap justify-between items-center cursor-not-allowed"
        >
          <p className="text-left">Do you have a coupons? Applied now</p>
          <span>
            <ChevronDown fill="currentColor" stroke="none" size={30} />
          </span>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.input
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              placeholder="Coupon.."
              type="text"
              className="bg-white border border-white min-h-full w-full p-2 focus:outline-none mt-2 text-black"
            />
          )}
        </AnimatePresence>
      </div>
      <button
        onClick={() => {
          if (products.length <= 0) {
            toast.error(
              "Nothing selected! Pick at least one item to checkout.",
              {
                duration: 3000,
                id: "no-items-selected",
                position: "top-center",
              },
            );

            return;
          }

          if (!isAutheticated) {
            toast.error("Please log in or sign up to proceed with checkout.", {
              duration: 3000,
              id: "checkout-error",
              position: "top-center",
            });

            return;
          }

          checkOut(products);
        }}
        className="bg-[#4278B9] cursor-pointer p-2 w-full mt-7 mb-4 border border-white rounded font-bold"
      >
        {isPending ? "Checking out.." : "Check Out"}
      </button>
      <p className="text-left">
        By clicking the button, you agree to the product(s) License Agreement(s)
        and the policy of Siwel Drax Beats.
      </p>
    </div>
  );
}

//
export function CartSummarySkeleton() {
  return (
    <div className="bg-[#04254D] p-4 pb-8 h-fit animate-pulse">
      <div className="h-8 w-40 rounded bg-[#4f79b8]/40" />

      <div className="flex justify-between items-center mt-5">
        <div className="h-6 w-16 rounded bg-[#4f79b8]/40" />
        <div className="h-7 w-28 rounded bg-[#4f79b8]/40" />
      </div>

      <div className="mt-7">
        <div className="flex justify-between items-center">
          <div className="h-5 w-56 rounded bg-[#4f79b8]/30" />
          <div className="h-7 w-7 rounded-full bg-[#4f79b8]/40" />
        </div>
      </div>

      <div className="h-11 w-full mt-7 rounded border border-white/30 bg-[#4278B9]/40" />

      <div className="mt-5 space-y-2">
        <div className="h-4 w-full rounded bg-[#4f79b8]/30" />
        <div className="h-4 w-11/12 rounded bg-[#4f79b8]/30" />
        <div className="h-4 w-8/12 rounded bg-[#4f79b8]/30" />
      </div>
    </div>
  );
}

/* Product Item*/
function Product({
  product,
  pendingRemoval,
  addToSelectedItems,
  removeFromSelectedItems,
  removeItemFromCart,
  nowPlayingLicenseType,
  setNowPlayingLicenseType,
}: {
  product: CartItem;
  pendingRemoval: boolean;
  addToSelectedItems: (value: SelectedItem) => void;
  removeFromSelectedItems: (value: SelectedItem) => void;
  removeItemFromCart: (value: { trackId: string; license: string }) => void;
  nowPlayingLicenseType: string;
  setNowPlayingLicenseType: (value: string) => void;
}) {
  const { playSong, isPlaying, isLoading, currentSongId, stopSong } =
    usePlayer();
  const [itemBeenRemoved, setItemBeenRemoved] = useState<null | string>(null);

  function toggleSong(songId: string) {
    if (
      isPlaying &&
      currentSongId === songId &&
      nowPlayingLicenseType === product.license
    ) {
      stopSong();
    } else {
      setNowPlayingLicenseType(product.license);
      playSong(songId);
    }
  }

  return (
    <div className="bg-[#6EACDA]/10 grid  grid-cols-1 sm:grid-cols-[230px_auto] sm:gap-4 md:gap-5 h-fit p-5">
      {/* Product Image */}
      <div className="max-h-75 w-full border border-gray-400 relative overflow-hidden aspect-square sm:aspect-auto">
        <img
          src={product.track.coverImageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div
          onClick={() => {
            toggleSong(product.productId);
          }}
          className="grid place-items-center absolute top-0 left-0 right-0 bottom-0 p-2 bg-[rgba(255,255,255,0.4)] rounded-full h-fit w-fit m-auto"
        >
          {isLoading &&
          currentSongId === product.productId &&
          nowPlayingLicenseType === product.license ? (
            <MoonLoader size={35} color="#1621ff" />
          ) : isPlaying &&
            currentSongId === product.productId &&
            nowPlayingLicenseType === product.license ? (
            <Pause size={50} fill="black" className="cursor-pointer" />
          ) : (
            <Play size={50} fill="black" className="cursor-pointer" />
          )}
        </div>
      </div>

      <div className="text-left mt-6 w-full">
        {/* Name */}
        <div className="flex flex-row flex-nowrap justify-between gap-2 mb-3">
          <h2
            style={{
              fontSize: "1.2rem",
              marginTop: 0,
              lineHeight: "30px",
            }}
          >
            {product.name}
          </h2>
          <input
            onChange={(e) => {
              if (e.target.checked) {
                addToSelectedItems({
                  productId: product.productId,
                  license: product.license,
                });
              } else {
                removeFromSelectedItems({
                  productId: product.productId,
                  license: product.license,
                });
              }
            }}
            className="h-5 w-5 cursor-pointer"
            type="checkbox"
            value={product.productId}
          />
        </div>

        {/* Details */}
        <div className="flex flex-row justify-between items-end">
          <div>
            <p
              style={{ fontSize: "1rem", marginBottom: "0.5rem" }}
              className="flex flex-row flex-nowrap gap-2 items-center"
            >
              <span className="font-bold">License:</span>{" "}
              <span>{product.license}</span>
            </p>
            <p
              style={{ fontSize: "1rem", marginBottom: "0.5rem" }}
              className="flex flex-row flex-nowrap gap-2 items-center"
            >
              <span className="font-bold">Price:</span>{" "}
              <span>
                {formatAmount(
                  product.status === "price_changed"
                    ? (product.newPrice as number)
                    : product.price,
                )}
              </span>
            </p>
            <p
              style={{ fontSize: "1rem" }}
              className="flex flex-row flex-nowrap gap-2 items-center"
            >
              <span className="font-bold">Status:</span>
              <span
                className={`${product.status !== "active" ? (product.status === "inactive" ? "text-red-600" : "text-blue-600") : "text-green-600"}`}
              >
                {product.status}
              </span>
            </p>
          </div>
          <button
            onClick={() => {
              setItemBeenRemoved(product.productId);
              removeItemFromCart({
                trackId: product.productId,
                license: product.license,
              });
            }}
            className="bg-red-600 p-2 w-24 h-10 text-md rounded cursor-pointer hover:bg-red-800 transition duration-300"
          >
            {pendingRemoval && itemBeenRemoved === product.productId
              ? "Removing.."
              : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Cart Page */
function CartPageFrame({
  children,
  totalItems,
}: {
  children: any;
  totalItems: number;
}) {
  return (
    <>
      <Header />
      <main className="mx-4 md:mx-10 mb-5 text-white">
        <h1 className="page-label">Cart ({totalItems})</h1>
        {children}
      </main>
      <Footer />
    </>
  );
}

export default function Cart() {
  const [selectedItems, setSelectedItems] = useState(
    new Map<string, SelectedItem>(),
  );

  const { isAutheticated, isLoading: authIsLoading } = useAuth();

  const [nowPlayingLicenseType, setNowPlayingLicenseType] = useState(""); // License type of the currently playing track. This helps to avoid showing playing icon on of the same license type track.

  const {
    data: localCart,
    removeFromLocalCart,
    pendingLocalRemoval,
  } = useLocalCart();

  // Todo: Later we will implement bulk merging for local and cloud cart products.
  useEffect(() => {
    const mergeCarts = () => {
      console.log({
        localCart: localCart?.items.map((item): SelectedItem => {
          return { productId: item.productId, license: item.license };
        }),
      });
    };

    if (isAutheticated) {
      mergeCarts();
    }
  }, [isAutheticated, localCart]);

  const addToSelectedItems = (item: SelectedItem) => {
    setSelectedItems((prev) => {
      const key = item.productId + ":" + item.license;
      if (prev.has(key)) {
        return prev;
      }

      const next = new Map(prev);
      next.set(key, item);

      return next;
    });
  };

  const removeFromSelectedItems = (item: SelectedItem) => {
    setSelectedItems((prev) => {
      const key = `${item.productId}:${item.license}`;

      const next = new Map(prev);
      next.delete(key);

      return next;
    });
  };

  const queryClient = useQueryClient();
  const { mutate: removeItemFromCart, isPending: pendingRemoval } = useMutation(
    {
      mutationFn: async (data: { trackId: string; license: string }) => {
        const res = await callApi<null>({
          endpoint: "/users/me/cart",
          body: data,
          method: "patch",
        });

        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["cart"],
        });

        toast.success("Item removed from your cart.", {
          duration: 3000,
          id: "item-removed",
          position: "top-center",
        });
      },
      onError: () => {
        toast.error("Failed to remove item from cart. Please try again.", {
          duration: 3000,
          id: "cart-remove-failed",
          position: "top-center",
        });
      },
    },
  );

  const { isLoading, data: cart } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await callApi<Cart>({
        endpoint: "/users/me/cart",
        method: "get",
      });
      return res.data;
    },
    enabled: isAutheticated,
  });

  if (isLoading || authIsLoading) {
    return (
      <CartPageFrame totalItems={0}>
        <section className={`grid grid-cols-1 lg:grid-cols-[auto_400px] gap-7`}>
          <div className="grid grid-col-1 md:grid-col-[200px_auto] gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <CartProductSkeleton key={index} />
            ))}
          </div>
          <CartSummarySkeleton />
        </section>
      </CartPageFrame>
    );
  } else if (isAutheticated && cart && cart.items.length > 0) {
    return (
      <CartPageFrame totalItems={cart.items.length}>
        <AnimatePresence>
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className={`grid grid-cols-1 lg:grid-cols-[auto_400px] gap-7`}
          >
            <div className="grid grid-col-1 md:grid-col-[200px_auto] gap-3">
              {cart?.items.map((item) => (
                <Product
                  addToSelectedItems={addToSelectedItems}
                  removeFromSelectedItems={removeFromSelectedItems}
                  removeItemFromCart={removeItemFromCart}
                  pendingRemoval={pendingRemoval}
                  key={item.productId + item.license}
                  product={item}
                  nowPlayingLicenseType={nowPlayingLicenseType}
                  setNowPlayingLicenseType={setNowPlayingLicenseType}
                />
              ))}
            </div>

            <CartSummary
              products={Array.from(selectedItems.values())}
              cartTotal={cart.subTotal}
            />
          </motion.section>
        </AnimatePresence>
      </CartPageFrame>
    );
  } else {
    if (localCart && localCart.items.length > 0) {
      return (
        <CartPageFrame totalItems={localCart.items.length}>
          <AnimatePresence>
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className={`grid grid-cols-1 lg:grid-cols-[auto_400px] gap-7`}
            >
              <div className="grid grid-col-1 md:grid-col-[200px_auto] gap-3">
                {localCart.items.map((item) => (
                  <Product
                    addToSelectedItems={addToSelectedItems}
                    removeFromSelectedItems={removeFromSelectedItems}
                    removeItemFromCart={removeFromLocalCart}
                    pendingRemoval={pendingLocalRemoval}
                    key={item.productId + item.license}
                    product={item}
                    nowPlayingLicenseType={nowPlayingLicenseType}
                    setNowPlayingLicenseType={setNowPlayingLicenseType}
                  />
                ))}
              </div>

              <CartSummary
                products={Array.from(selectedItems.values())}
                cartTotal={localCart.subTotal}
              />
            </motion.section>
          </AnimatePresence>
        </CartPageFrame>
      );
    } else {
      return (
        <CartPageFrame totalItems={0}>
          <AnimatePresence>
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              style={{
                fontSize: "2rem",
                textAlign: "left",
                marginBottom: "auto",
                display: "block",
              }}
            >
              Your cart is empty.
            </motion.h3>
          </AnimatePresence>
        </CartPageFrame>
      );
    }
  }
}
