import React, {
  useEffect,
  useState,
} from "react";

import ReactDOM from "react-dom/client";

import App from "./App";

import {
  AuthProvider,
} from "./context/AuthContext";

import {
  CartProvider,
} from "./context/CartContext";

import SiteSettingsManager from "./components/SiteSettingsManager";
import Footer from "./components/Footer";

import "./index.css";


// =====================================================
// PUBLIC FOOTER
// =====================================================

function PublicFooter() {
  const [
    currentPath,
    setCurrentPath,
  ] = useState(
    window.location.pathname
  );

  useEffect(() => {
    const handlePathChange = () => {
      setCurrentPath(
        window.location.pathname
      );
    };

    window.addEventListener(
      "popstate",
      handlePathChange
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePathChange
      );
    };
  }, []);

  // ===================================================
  // AUTH PAGES
  // Footer should not appear on login/register
  // ===================================================

  if (
    currentPath === "/login" ||
    currentPath === "/register"
  ) {
    return null;
  }

  // ===================================================
  // ADMIN PAGES
  // Footer should not appear inside admin panel
  // ===================================================

  if (
    currentPath.startsWith("/admin")
  ) {
    return null;
  }

  // ===================================================
  // PUBLIC / CUSTOMER WEBSITE
  // ===================================================

  return <Footer />;
}


// =====================================================
// ROOT APPLICATION
// =====================================================

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>

    <AuthProvider>

      <CartProvider>

        {/* =================================================
            GLOBAL SITE SETTINGS
        ================================================= */}

        <SiteSettingsManager />

        {/* =================================================
            MAIN APPLICATION
        ================================================= */}

        <App />

        {/* =================================================
            CUSTOMER WEBSITE FOOTER
        ================================================= */}

        <PublicFooter />

      </CartProvider>

    </AuthProvider>

  </React.StrictMode>
);