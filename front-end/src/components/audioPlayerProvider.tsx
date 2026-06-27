import { useEffect, useRef, useState } from "react";
import audioPlayerContext from "../hooks/contexts/audioPlayerContext";
import env from "../config/env";

export default function AudioPlayerProvider({ children }) {
  const audio = useRef<HTMLAudioElement>(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);

  useEffect(() => {
    const handleEndedEvent = () => {
      setIsPlaying(false);
    };

    const handleLoadedEvent = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    const audioElement = audio.current;
    audioElement?.addEventListener("ended", handleEndedEvent);
    audioElement?.addEventListener("loadeddata", handleLoadedEvent);

    return () => {
      audioElement?.removeEventListener("ended", handleEndedEvent);
      audioElement?.removeEventListener("loadeddata", handleLoadedEvent);
    };
  }, []);

  const playSong = async (songId: string) => {
    try {
      setIsLoading(true);
      setCurrentSongId(songId);

      audio.current.src = `${env.BACKEND_URL}/api/v1/tracks/${songId}/stream`;
      audio.current.currentTime = 0;
      audio.current.play();
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
      value={{
        isPlaying,
        isLoading,
        currentSongId,
        playSong,
        stopSong,
        pauseSong,
      }}
    >
      {children}
    </audioPlayerContext.Provider>
  );
}
