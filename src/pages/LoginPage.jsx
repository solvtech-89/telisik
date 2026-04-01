import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import { useAuth } from "../AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";

const DEMO_TOKEN_PREFIX = "demo-token-";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const redirectAfterLogin =
    location.state?.from?.pathname || "/urun-daya/kronik";

  const handleCancel = () => {
    navigate("/", { replace: true });
  };

  const handleThemeToggle = () => {
    const currentTheme =
      document.documentElement.getAttribute("data-bs-theme") || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-bs-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setError("Silakan setujui Syarat & Ketentuan dan Kebijakan Privasi");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.access_token, data.user);
        navigate(data.redirect_url || redirectAfterLogin, { replace: true });
      } else {
        setError(data?.error || "Login gagal. Silakan cek email dan password");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  const handleFakeLogin = () => {
    const demoUser = {
      id: "demo-user",
      username: "demo",
      display_name: "Demo User",
      email: "demo@telisik.local",
      avatar: null,
      profile_completed: true,
      is_demo: true,
    };

    login(`${DEMO_TOKEN_PREFIX}${Date.now()}`, demoUser);
    navigate(redirectAfterLogin, { replace: true });
  };

  return (
    <div className="min-h-screen px-4" style={{ background: "inherit" }}>
      <div className="mx-auto w-full max-w-sm">
        {/* Top controls (auth header) */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            aria-label="Kembali"
            onClick={handleCancel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white/40 text-neutral-600 hover:bg-white/70"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-full border border-telisik/40 px-3 py-1.5 text-xs font-semibold text-telisik hover:bg-telisik/10"
            >
              Batalkan
            </button>

            <button
              type="button"
              className="theme-toggle-switch"
              onClick={handleThemeToggle}
              aria-label="Toggle theme"
            >
              <div className="theme-toggle-indicator" aria-hidden></div>
              <span className="theme-toggle-icon icon-sun">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2" />
                  <path d="M12 21v2" />
                  <path d="M4.22 4.22l1.42 1.42" />
                  <path d="M18.36 18.36l1.42 1.42" />
                  <path d="M1 12h2" />
                  <path d="M21 12h2" />
                  <path d="M4.22 19.78l1.42-1.42" />
                  <path d="M18.36 5.64l1.42-1.42" />
                </svg>
              </span>
              <span className="theme-toggle-icon icon-moon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </span>
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="pt-10 pb-6 text-center">
          <h1 className="text-[1.35rem] font-semibold tracking-tight text-neutral-800">
            Masuk Log
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="font-semibold text-telisik hover:text-telisik-dark transition-colors"
            >
              GABUNG →
            </Link>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            type="danger"
            message={error}
            onClose={() => setError("")}
            className="mb-6"
          />
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <Input
            type="email"
            placeholder="Surel"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-md border border-neutral-200 bg-white"
          />

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:border-telisik focus:ring-2 focus:ring-telisik/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-500 hover:text-gray-700 transition-colors p-1"
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <Link
              to="/forgot-password"
              className="text-xs text-cyan-600 hover:text-cyan-700 transition-colors text-right"
            >
              Lupa?{" "}
              <span style={{ color: "#0088FF" }}>Atur ulang kata sandi</span>
            </Link>
          </div>

          {/* Terms Switch */}
          <label
            htmlFor="agreeTerms"
            className="flex items-start gap-3 pt-1 cursor-pointer"
          >
            <span className="relative mt-0.5 inline-flex h-5 w-10 flex-shrink-0">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="peer sr-only"
                aria-checked={agreed}
              />
              <span className="absolute inset-0 rounded-full bg-neutral-100 border border-neutral-300 transition-colors duration-200 peer-checked:bg-telisik/20 peer-checked:border-telisik" />
              <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white border border-neutral-200 shadow transition-transform duration-200 peer-checked:translate-x-5 peer-checked:bg-white peer-checked:border-telisik" />
            </span>

            <span className="text-xs text-neutral-600 leading-relaxed">
              Saya sudah membaca, memahami, dan menyetujui{" "}
              <Link
                to="/pages/terms-and-conditions"
                className="hover:underline"
                onClick={(e) => e.stopPropagation()}
                style={{ color: "#0088FF" }}
              >
                Syarat & Ketentuan
              </Link>{" "}
              serta{" "}
              <Link
                to="/pages/privacy-policy"
                className="hover:underline"
                onClick={(e) => e.stopPropagation()}
                style={{ color: "#0088FF" }}
              >
                Kebijakan Privasi
              </Link>{" "}
              Telisik.
            </span>
          </label>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              fullWidth
              size="sm"
              variant="secondary"
              disabled={!agreed}
              loading={loading}
              onClick={handleFakeLogin}
              className="rounded-full shadow-sm bg-[#dedacb] text-[#6b6b6b] hover:bg-[#dedacb] active:bg-[#dedacb]"
            >
              Masuk Log
            </Button>

            {/* <Button
              type="button"
              fullWidth
              size="sm"
              variant="outline"
              className="mt-3 rounded-full"
              onClick={handleFakeLogin}
            >
              Login Demo
            </Button> */}
          </div>
        </form>
      </div>
    </div>
  );
}
