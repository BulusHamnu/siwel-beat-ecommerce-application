import useAuth from "../hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";
import { RotateLoader } from "react-spinners";

export default function UserRoutesGuard() {
  const { isAutheticated, isLoading, data: user } = useAuth();

  if (isLoading) {
    return (
      <div className="grid place-content-center h-screen">
        <RotateLoader color="#ffffff" />
      </div>
    );
  }

  if (isAutheticated) {
    if (user?.role !== "user") return <Navigate to="/" replace />;

    return (
      <>
        <Header />
        <Outlet />
        <Footer />
      </>
    );
  } else {
    return <Navigate to="/auth?action=login" replace />;
  }
}
