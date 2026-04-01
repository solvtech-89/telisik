import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ArticlePage from "./pages/ArticlePage";
import ArticleListPage from "./pages/ArticleListPage";
import FeaturedImageManager from "./components/FeaturedImageManager";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import VerifyOTPPage from "./pages/VerifyOTPPage";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import StaticPage from "./pages/StaticPage";
import KronikTilikEditor from "./pages/ArticleEditorPage";

function AppFrame() {
  const location = useLocation();
  const hideNavbar = [
    "/login",
    "/register",
    "/verify-otp",
    "/complete-profile",
  ].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className={!hideNavbar ? "app-route-shell" : undefined}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/article/:tipe" element={<ArticleListPage />} />
          <Route path="/article/:tipe/:slug" element={<ArticlePage />} />
          <Route path="/featured-images" element={<FeaturedImageManager />} />
          <Route path="/pages/:slug" element={<StaticPage />} />
          <Route
            path="/complete-profile"
            element={
              <ProtectedRoute>
                <CompleteProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/urun-daya/:tipe"
            element={
              <ProtectedRoute>
                <KronikTilikEditor />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppFrame />
    </BrowserRouter>
  );
}
