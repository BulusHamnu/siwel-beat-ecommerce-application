import { Heart, ShoppingCart, Play, Pause } from "lucide-react";
import { formatAmount } from "../helpers/helpers";
// Download
import usePlayer from "../hooks/usePlayer";

export interface Track {
  _id: string;
  coverImageUrl: string;
  coverImagePath: string;
  title: string;
  description: string;
  type: string;
  key: string;
  status: "draft" | "published" | "unpublished";
  bpm: number;
  tags: string[];
  basicPrice: number;
  premiumPrice: number;
  genre: string;
  relatedTrack: Track[];
  createdAt: Date;
  updatedAt: Date;
}

/* Track card */
function TrackCard({ track }: { track: Track }) {
  const { playSong, isPlaying, currentSongId, stopSong } = usePlayer();

  function toggleSong(songId: string) {
    if (isPlaying && currentSongId === songId) {
      stopSong();
    } else {
      playSong(songId);
    }
  }

  return (
    <div className="border border-white max-w-87.5 w-full p-2 bg-[#4278B9] cursor-pointer rounded-lg">
      <div className="cover-image h-64 overflow-hidden relative">
        <img
          className="w-full h-full object-cover"
          src={track.coverImageUrl}
          alt="Track Cover"
        />
        <div
          onClick={() => {
            toggleSong(track._id);
          }}
          className="grid place-items-center absolute top-0 left-0 right-0 bottom-0 p-2 bg-[rgba(255,255,255,0.4)] rounded-full h-fit w-fit m-auto"
        >
          {isPlaying && currentSongId === track._id ? (
            <Pause size={50} fill="black" className="cursor-pointer" />
          ) : (
            <Play size={50} fill="black" className="cursor-pointer" />
          )}
        </div>
      </div>
      <div className="text-left p-4">
        <p className="text-lg md:text-xl truncate w-full">{track.title}</p>
        <div className="meta-data flex flex-row flex-nowrap gap-3 mt-2">
          <p>Key: {track.key}</p>
          <p>BPM: {track.bpm}</p>
        </div>
        <div className="tags mt-3 flex flex-row flex-wrap items-center gap-1">
          <p>Tags:</p>
          {track.tags.map((tag, index) => (
            <span className="text-gray-700 font-semibold" key={index}>
              #{tag}
            </span>
          ))}
        </div>
        <div className="bg-[#04254D] mt-3 flex flex-row flex-nowrap items-center justify-between p-2.5 px-4">
          <p className="text-lg">
            Price <span>{formatAmount(track.basicPrice)}</span>
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
