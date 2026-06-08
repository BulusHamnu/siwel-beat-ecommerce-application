import { useState, useEffect } from "react";
import { motion } from "motion/react";
import type { Track } from "./trackCard";
import { formatAmount } from "../helpers/helpers";
import { X } from "lucide-react";

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
      className={`${selected === tab ? "bg-[#04254D]" : "rounded-md border border-black text-black"} cursor-pointer p-1 max-w-full rounded-md text-sm whitespace-nowrap font-bold`}
      onClick={() => setActiveTab(tab)}
    >
      {placeholder}
    </motion.button>
  );
}

function LicenseTerm({ type }: { type: "basic" | "premium" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
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
      <button
        onClick={() => console.log(type)}
        style={{ background: "#2E6D9B" }}
        className="button-primary w-full mt-4"
      >
        {type === "premium" ? "Add premium to cart" : "Add basic to cart"}
      </button>
    </motion.div>
  );
}

/* Track License Modal */
function LicenseModal({
  isOpen,
  setIsOpen,
  track,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  track: Track;
}) {
  const [selected, setSelected] = useState("basic");

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
        onClick={() => setIsOpen(false)}
        className={`${isOpen ? "block" : "hidden"} fixed top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.5)] z-49`}
      ></div>
      <div
        className={`bg-[#03346E] p-3 rounded-md border border-white ${isOpen ? "block" : "hidden"} z-50 license-modal relative`}
      >
        <h3>Please select a license</h3>
        <span
          onClick={() => setIsOpen(false)}
          className="absolute right-2 top-2 bg-white cursor-pointer"
        >
          <X size={24} color="black" />
        </span>
        <div className="bg-white max-w-175 mx-auto rounded-xs grid grid-cols-2 items-center gap-2 p-1 mt-3">
          <TabBtn
            tab="basic"
            setActiveTab={setSelected}
            selected={selected}
            placeholder={`Basic ${formatAmount(track.basicPrice)}`}
          />
          <TabBtn
            tab="premium"
            setActiveTab={setSelected}
            selected={selected}
            placeholder={`Premium ${formatAmount(track.premiumPrice)}`}
          />
        </div>
        <div className="p-1">
          {selected === "basic" ? (
            <LicenseTerm type="basic" />
          ) : (
            <LicenseTerm type="premium" />
          )}
        </div>
      </div>
    </>
  );
}

export default LicenseModal;
