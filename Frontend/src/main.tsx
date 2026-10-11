import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./utils/axios";
import "./index.css";
import App from "./App";
import { UserProvider } from "./components/context/UserContext";
import { CartProvider } from "./components/context/CartContext";
import { OffersProvider } from "./components/context/OffersContext";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <CartProvider>
          <OffersProvider>
            <App />
          </OffersProvider>
        </CartProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>
);
