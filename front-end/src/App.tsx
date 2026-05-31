import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Auth from "./pages/auth";
import { Toaster } from "react-hot-toast";

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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
