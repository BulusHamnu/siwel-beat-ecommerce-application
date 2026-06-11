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
// import ProtectedRoute from "./components/protectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <div className="container">
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
                  <Route path="/" element={<Home />} />
                  <Route path="/auth" element={<Auth />} />
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
