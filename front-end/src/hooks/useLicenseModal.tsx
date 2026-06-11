import { useContext } from "react";
import licenseModalContext from "./licenseModalContext";

function useLicenseModal() {
  const context = useContext(licenseModalContext);

  if (!context)
    throw Error("useLicenseModal can only be use inside licenseModalContext.");

  return context;
}

export default useLicenseModal;
