import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { API_BASE } from "../config";
import { useAuth } from "../AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

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
        navigate(data.redirect_url);
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

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch(`${API_BASE}/auth/google/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.access_token, data.user);

        if (!data.user.profile_completed) {
          navigate("/complete-profile", {
            state: { registrationMethod: "google" },
          });
        } else {
          navigate("/");
        }
      } else {
        const errorData = await response.json();
        setError(`Google login gagal: ${errorData?.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Google login error:", error);
      setError("Terjadi kesalahan saat login dengan Google");
    }
  };

  const handleGoogleError = () => {
    setError("Google login gagal. Silakan coba lagi.");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-neutral-50">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Masuk Log</h1>
          <p className="text-neutral-600">
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
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <Input
            type="email"
            label="Email"
            placeholder="pengguna@mail.mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-telisik focus:ring-2 focus:ring-telisik/10 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-500 hover:text-gray-700 transition-colors p-1"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
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
              Lupa? Atur ulang kata sandi
            </Link>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 cursor-pointer accent-telisik rounded"
            />
            <label htmlFor="agreeTerms" className="text-xs text-neutral-600 cursor-pointer leading-relaxed">
              Saya sudah membaca, memahami, dan menyetujui{" "}
              <Link
                to="/pages/terms-and-conditions"
                className="text-cyan-600 hover:underline"
              >
                Syarat & Ketentuan
              </Link>{" "}
              serta{" "}
              <Link
                to="/pages/privacy-policy"
                className="text-cyan-600 hover:underline"
              >
                Kebijakan Privasi
              </Link>{" "}
              Telisik.
            </label>
          </div>

          {/* Submit Button */}
          <Button
            fullWidth
            disabled={!agreed}
            loading={loading}
            className="rounded-full"
          >
            Masuk Log
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-xs text-gray-500">atau</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Google Login Button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="signin_with"
              shape="pill"
              logo_alignment="left"
              width="100%"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
