import { ChevronDown, Play, Pause } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { formatAmount } from "../helpers/helpers";

interface CartItem {
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

function Product({ product }: { product: CartItem }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);

  return (
    <div className="bg-[#6EACDA]/10 grid  grid-cols-1 sm:grid-cols-[230px_auto] sm:gap-4 md:gap-5 h-fit p-5">
      {/* Product Image */}
      <div className="max-h-75 w-full border border-gray-400 relative overflow-hidden">
        <img
          src={product.track.coverImageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div
          onClick={() => {
            setIsPlaying(true);
            setCurrentSongId(product.productId);
          }}
          className="grid place-items-center absolute top-0 left-0 right-0 bottom-0 p-2 bg-[rgba(255,255,255,0.4)] rounded-full h-fit w-fit m-auto"
        >
          {isPlaying && currentSongId === product.productId ? (
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
            onClick={() => alert(`${product.productId} was removed.`)}
            className="bg-red-600 p-2 w-24 h-10 text-md rounded cursor-pointer hover:bg-red-800 transition duration-300"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

//
export default function Cart() {
  const [isOpen, setIsOpen] = useState(false);
  const [items] = useState<CartItem[]>([
    {
      name: "Niggas tryna play for keeps (Prod. Siwel beats)",
      productId: "69e61f5f183bb3f54a43ba0c",
      price: 4000,
      license: "basic",
      type: "single",
      status: "active",
      newPrice: null,
      track: {
        id: "69e61f5f183bb3f54a43ba0c",
        title: "Sunrise",
        coverImageUrl:
          "https://alztamolvzjflmxlmiyq.supabase.co/storage/v1/object/public/images/cover-images/c21dfb7c4c83154f1db0ddcb049d1619-file_000000008230720aaf81cd92011ad5a5.png",
        key: "B minor",
        bpm: 150,
        genre: "drill",
      },
    },
    {
      name: "Uk roadman drill type (Prod. Siwel beats)",
      productId: "69e3980bfc25c1b2a4edb897",
      price: 4500,
      license: "premium",
      type: "single",
      status: "inactive",
      newPrice: null,
      track: {
        id: "69e3980bfc25c1b2a4edb897",
        title: "Forever My Own",
        coverImageUrl:
          "https://alztamolvzjflmxlmiyq.supabase.co/storage/v1/object/public/images/cover-images/952d5dd95261bb5f3e70d88693d7935b-file_00000000afec720a8216b0a6f7c7e533.png",
        key: "C minor",
        bpm: 200,
        genre: "drill",
      },
    },
    {
      name: "US roadman drill type (Prod. Siwel beats)",
      productId: "69e3980bfc25c1b2a4edb8s97",
      price: 4500,
      license: "premium",
      type: "single",
      status: "price_changed",
      newPrice: 5000,
      track: {
        id: "69e3980bfc25c1b2a4edb897",
        title: "Forever My Own",
        coverImageUrl: "public/track-cover-image.png",
        key: "C minor",
        bpm: 200,
        genre: "drill",
      },
    },
  ]);

  return (
    <main className="mx-4 md:mx-10 mb-20 text-white">
      <h1 className="page-label">Cart ({items.length})</h1>
      <section className="grid grid-cols-1 lg:grid-cols-[auto_400px]  gap-7">
        <div className="grid grid-col-1 md:grid-col-[200px_auto] gap-3">
          {items.map((item) => (
            <Product key={item.productId} product={item} />
          ))}
        </div>
        <div className="bg-[#04254D] p-4 pb-8  h-fit">
          <h2 className="text-left">Cart Summary</h2>
          <div className="flex flex-row justify-between items-center mt-3">
            <span className="font-bold text-lg">Sub-Total</span>
            <span className="text-lg">$123</span>
          </div>
          <div className="mt-7">
            <div
              onClick={() => setIsOpen(!isOpen)}
              className="flex flex-row flex-nowrap justify-between items-center cursor-pointer"
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
          <button className="bg-[#4278B9] cursor-pointer p-2 w-full mt-7 mb-4 border border-white rounded font-bold">
            Check Out
          </button>
          <p className="text-left">
            By clicking the button, you agree to the product(s) License
            Agreement(s) and the policy of Siwel Drax Beats.
          </p>
        </div>
      </section>
    </main>
  );
}
