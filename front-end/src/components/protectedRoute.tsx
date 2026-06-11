import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { isAutheticated } = useAuth();
  const navigate = useNavigate();

  if (!isAutheticated) {
    navigate("/auth?action=login");
  } else {
    return children;
  }
}
