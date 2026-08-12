/* Scroll To Hash Hook */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function useScrollToHash() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      document.querySelector(hash)?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [hash]);
}

export default useScrollToHash;
