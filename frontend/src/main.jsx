import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { PageTitleProvider } from "./context/PageTitleContext";

import "./style.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PageTitleProvider>
          <App />
        </PageTitleProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
