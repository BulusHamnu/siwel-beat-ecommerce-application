import { useState } from "react";
import licenseModalContext from "../hooks/contexts/licenseModalContext";
import type { Track } from "./trackCard";

export default function LicenseModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<Track | null>(null);

  const showLicenseModal = (track: Track) => {
    setData(track);
    setIsOpen(true);
  };

  const hideLicenseModal = () => {
    setIsOpen(false);
    setData(null);
  };

  const values = { isOpen, data, showLicenseModal, hideLicenseModal };

  return (
    <licenseModalContext.Provider value={values}>
      {children}
    </licenseModalContext.Provider>
  );
}
