import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Auth from "./pages/auth";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AudioPlayerProvider from "./components/audioPlayerProvider";
import LicenseModal from "./components/licenseModal";
import LicenseModalProvider from "./components/licenseModalProvider";
import AuthContextProvider from "./components/authProvider";
import NotFound from "./pages/notFound";
import Cart from "./pages/cart";
import UserRoutesGuard from "./components/userRoutesGuard";

const queryClient = new QueryClient();

function App() {
  return (
    <div className="container flex flex-col">
      <Toaster
        toastOptions={{
          className: "",
          style: {
            background: "#04254D",
            color: "#FFFFFF",
            border: "1px solid #FFFFFF",
          },
        }}
      />

      <QueryClientProvider client={queryClient}>
        <AudioPlayerProvider>
          <LicenseModalProvider>
            <LicenseModal />
            <BrowserRouter>
              <AuthContextProvider>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/auth" element={<Auth />} />

                  {/* User Routes */}
                  <Route element={<UserRoutesGuard />}>
                    <Route path="/cart" element={<Cart />} />
                  </Route>

                  {/* Not found page */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthContextProvider>
            </BrowserRouter>
          </LicenseModalProvider>
        </AudioPlayerProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
