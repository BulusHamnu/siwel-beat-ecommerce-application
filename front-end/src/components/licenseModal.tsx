import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { formatAmount } from "../helpers/helpers";
import { X } from "lucide-react";
import useLicenseModal from "../hooks/useLicenseModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import callApi from "../lib/callApi";
import { toast } from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import useLocalCart from "../hooks/useLocalCart";

function TabBtn({
  placeholder,
  selected,
  tab,
  setActiveTab,
}: {
  placeholder: string;
  selected: string;
  tab: string;
  setActiveTab: (value: string) => void;
}) {
  return (
    <motion.button
      whileHover={{
        opacity: 0.8,
        transition: { duration: 0.3 },
      }}
      transition={{ duration: 0.5 }}
      className={`${selected === tab ? "bg-[#04254D] text-white" : "rounded-md border border-black text-black"} cursor-pointer p-1 max-w-full rounded-md text-sm whitespace-nowrap font-bold`}
      onClick={() => setActiveTab(tab)}
    >
      {placeholder}
    </motion.button>
  );
}

function LicenseTerm({ type }: { type: "basic" | "premium" }) {
  const { data: track, hideLicenseModal } = useLicenseModal();
  const queryClient = useQueryClient();
  const { isAutheticated } = useAuth();

  // Local cart logic
  const { addTrackToLocalCart, status } = useLocalCart();
  useEffect(() => {
    switch (status) {
      case "success": {
        toast.success("Track has been added to your cart.", {
          duration: 3000,
          id: "item-added-to-cart",
          position: "top-center",
        });

        setTimeout(() => {
          hideLicenseModal();
        }, 500);

        break;
      }

      case "product-exists": {
        toast.error("A track with this license is already in your cart.", {
          duration: 3000,
          id: "track-license-exists",
          position: "top-center",
        });

        setTimeout(() => {
          hideLicenseModal();
        }, 500);

        break;
      }

      case "failed": {
        toast.error(
          "Couldn't add track to your cart. Please try again later.",
          {
            duration: 3000,
            id: "add-to-cart-failed",
            position: "top-center",
          },
        );
        break;
      }
    }
  }, [status, hideLicenseModal]);
  //

  const { mutate: addTrackToCart, isPending } = useMutation({
    mutationFn: async (data: { trackId: string; license: string }) => {
      const res = await callApi<null>({
        endpoint: "/users/me/cart",
        body: data,
        method: "post",
      });

      return res.data;
    },
    onSuccess: () => {
      toast.success("Track has been added to your cart.", {
        duration: 3000,
        id: "item-added-to-cart",
        position: "top-center",
      });

      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });

      hideLicenseModal();
    },
    onError: (err: any) => {
      const errCode = err.response.data?.error.code;

      switch (errCode) {
        case "TRACK_NOT_FOUND": {
          toast.error("Track is currently unavailable.", {
            duration: 3000,
            id: "track-unavailable",
            position: "top-center",
          });
          break;
        }

        case "PRODUCT_ALREADY_EXISTS": {
          toast.error("A track with this license is already in your cart.", {
            duration: 3000,
            id: "track-license-exists",
            position: "top-center",
          });
          break;
        }

        default: {
          toast.error(
            "Couldn't add track to your cart. Please try again later.",
            {
              duration: 3000,
              id: "add-to-cart-failed",
              position: "top-center",
            },
          );
          break;
        }
      }
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-white text-sm text-left"
    >
      <h4 className="my-3">
        {type === "premium"
          ? "🚀 Premium License (Exclusive)"
          : "🎯 Basic License (Non-Exclusive)"}
      </h4>
      {type === "premium" ? (
        <div className="flex flex-col flex-nowrap gap-1.5 ">
          <p>✔ MP3, WAV & Stems</p>
          <p>✔ Unlimited Streams & Sales</p>
          <p>✔ Full Commercial & Monetization Rights</p>
          <p>✔ TV/Radio Play Allowed</p>
          <p>✔ Beat Removed from Listings (No Other Artist Can Buy)</p>
          <p>✔ Full Ownership & Customization</p>
        </div>
      ) : (
        <div className="flex flex-col flex-nowrap gap-1.5 ">
          <p>✔ MP3 File</p>
          <p>✔ Limited Streaming (Up to 30,000 Streams)</p>
          <p>✔ Limited Distribution (Up to 20,000 Copies)</p>
          <p>✔ Use for Music Videos, Social Media, and Performances</p>
          <p>✖ Not Eligible for TV/Radio Play</p>
          <p>✖ No Exclusive Rights (Beat Can Be Sold to Others)</p>
        </div>
      )}
      <motion.button
        whileHover={{
          opacity: 0.8,
          transition: { duration: 0.3 },
        }}
        onClick={() => {
          if (isAutheticated) {
            addTrackToCart({ trackId: track._id, license: type });
          } else {
            addTrackToLocalCart(track, type);
          }
        }}
        style={{ background: "#2E6D9B" }}
        className="button-primary w-full mt-4"
      >
        {isPending
          ? "Adding Track.."
          : type === "premium"
            ? "Add premium to cart"
            : "Add basic to cart"}
      </motion.button>
    </motion.div>
  );
}

/* Track License Modal */
function LicenseModal() {
  const [selected, setSelected] = useState("basic");
  const { isOpen, data: track, hideLicenseModal } = useLicenseModal();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <div
        onClick={() => hideLicenseModal()}
        className={`${isOpen ? "block" : "hidden"} fixed top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.5)] z-49`}
      ></div>

      {/* ${isOpen ? "block" : "hidden" */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className={`bg-[#03346E] p-3 rounded-md border border-white } z-50 license-modal relative`}
        >
          <h3>Please select a license</h3>
          <span
            onClick={() => hideLicenseModal()}
            className="absolute right-2 top-2 bg-white cursor-pointer"
          >
            <X size={24} color="black" />
          </span>
          <div className="bg-white max-w-175 mx-auto rounded-xs grid grid-cols-2 items-center gap-2 p-1 mt-3">
            <TabBtn
              tab="basic"
              setActiveTab={setSelected}
              selected={selected}
              placeholder={`Basic ${formatAmount(track?.basicPrice)}`}
            />
            <TabBtn
              tab="premium"
              setActiveTab={setSelected}
              selected={selected}
              placeholder={`Premium ${formatAmount(track?.premiumPrice)}`}
            />
          </div>
          <div className="p-1">
            {selected === "basic" ? (
              <LicenseTerm key="basic" type="basic" />
            ) : (
              <LicenseTerm key="premium" type="premium" />
            )}
          </div>
        </motion.div>
      )}
    </>
  );
}

export default LicenseModal;
