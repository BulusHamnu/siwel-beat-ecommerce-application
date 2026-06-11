import { useContext } from "react";
import authContext from "./contexts/authContext";

export default function useAuth() {
  const context = useContext(authContext);

  if (!context)
    throw new Error("useAuth can only be use inside useAuthContext.");

  return context;
}
