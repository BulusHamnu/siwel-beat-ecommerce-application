import { Heart, ShoppingCart, Play } from "lucide-react";
// Download

/* Track card */
function TrackCard() {
  return (
    <div className="border border-white max-w-87.5 w-full p-1 bg-[#4278B9] cursor-pointer">
      <div className="cover-image h-64 overflow-hidden relative">
        <img
          className="w-full h-full object-cover"
          src="/track-cover-image.png"
          alt="Track Cover"
        />
        <div className="grid place-items-center absolute top-0 left-0 right-0 bottom-0">
          <Play size={50} fill="white" className="cursor-pointer" />
        </div>
      </div>
      <div className="text-left p-4">
        <p className="text-lg md:text-xl truncate w-full">
          Uk roadman drill type beat (prod by siwel draxx)
        </p>
        <div className="meta-data flex flex-row flex-nowrap gap-3 mt-2">
          <p>Key: C minor</p>
          <p>BPM: 200</p>
        </div>
        <div className="tags mt-3 flex flex-row flex-wrap items-center gap-1">
          <p>Tags:</p>
          {[
            "drill",
            "uk",
            "kayflock",
            "kfc-chicken-init",
            "siwelbeats",
            "shanky",
          ].map((tag, index) => (
            <span className="text-gray-700 font-semibold" key={index}>
              #{tag}
            </span>
          ))}
        </div>
        <div className="bg-[#04254D] mt-3 flex flex-row flex-nowrap items-center justify-between p-2.5 px-4">
          <p className="text-lg">
            Price <span>$320</span>
          </p>
          <div className="flex flex-row gap-4 items-center flex-nowrap">
            <span className="p-1 border border-white rounded cursor-pointer hover:bg-[#10458a] transition-colors duration-300">
              <Heart size={22} />
            </span>
            <span className="p-1 border border-white rounded cursor-pointer hover:bg-[#10458a] transition-colors duration-300">
              <ShoppingCart size={22} />
            </span>
            {/* <span className="p-1 border border-white rounded cursor-pointer hover:bg-[#10458a] transition-colors duration-300">
              <Download size={22} />
            </span> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrackCard;
