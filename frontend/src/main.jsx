import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { CartProvider } from "./context/CartContext";
import { CustomerAuthProvider } from "./context/CustomerAuthContext";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
        <CustomerAuthProvider>
          <App />
        </CustomerAuthProvider>
      </CartProvider>
    </BrowserRouter>
  </StrictMode>
);
