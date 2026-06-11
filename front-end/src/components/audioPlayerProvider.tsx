import { useEffect, useRef, useState } from "react";
import audioPlayerContext from "../hooks/contexts/audioPlayerContext";
import env from "../config/env";

export default function AudioPlayerProvider({ children }) {
  const audio = useRef<HTMLAudioElement>(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);

  useEffect(() => {
    const handleEndedListener = () => {
      setIsPlaying(false);
    };

    const audioElement = audio.current;
    audioElement?.addEventListener("ended", handleEndedListener);

    return () => {
      audioElement?.removeEventListener("ended", handleEndedListener);
    };
  }, []);

  const playSong = async (songId: string) => {
    try {
      setCurrentSongId(songId);

      audio.current.src = `${env.BACKEND_URL}/api/v1/tracks/${songId}/stream`;
      audio.current.currentTime = 0;
      audio.current.play();

      setIsPlaying(true);
    } catch (error: any) {
      console.log("Unable to play audio", error.messsage);
    }
  };

  const stopSong = () => {
    audio.current.pause();
    audio.current.currentTime = 0;
    audio.current.src = "";

    setCurrentSongId(null);
    setIsPlaying(false);
  };

  const pauseSong = () => {
    audio.current.pause();
    setIsPlaying(false);
  };

  return (
    <audioPlayerContext.Provider
      value={{ isPlaying, currentSongId, playSong, stopSong, pauseSong }}
    >
      {children}
    </audioPlayerContext.Provider>
  );
}
