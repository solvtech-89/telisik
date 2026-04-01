import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./AuthContext";
import "./index.css";
import App from "./App.jsx";

// Ensure saved theme is applied as early as possible so all pages
// (including logged-in/dashboard routes) render correctly in dark mode.
if (typeof window !== "undefined") {
  try {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      document.documentElement.setAttribute("data-bs-theme", savedTheme);
    }
  } catch (e) {
    // localStorage may be unavailable in some environments — fail silently
    // so the app still boots with default theme.
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
      disableFedCM={true}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
