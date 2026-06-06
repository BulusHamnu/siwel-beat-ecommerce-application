import { useContext } from "react";
import audioPlayerContext from "./audioPlayerContext";

function usePlayer() {
  const context = useContext(audioPlayerContext);

  if (!context)
    throw Error("usePlayer can only be use inside audioPlayerContext.");
  return context;
}

export default usePlayer;
