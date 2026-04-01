import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import { useAuth } from "../AuthContext";
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
  const location = useLocation();
  const { login } = useAuth();
  const redirectAfterLogin =
    location.state?.from?.pathname || "/urun-daya/kronik";

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

  return (
    <div className="min-h-screen px-4" style={{ background: "inherit" }}>
      <div className="mx-auto w-full max-w-[340px] pb-10 pt-7">
        {/* Header */}
        <div className="pb-3">
          <h1 className="text-[clamp(2.18rem,8vw,2.85rem)] font-semibold leading-[0.98] tracking-[-0.01em] text-[#555333]">
            Masuk Log
          </h1>
          <p className="mt-1.5 text-[1.05rem] text-[#555333]/90">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#FC6736] hover:text-[#e0592d] transition-colors"
              style={{ color: "#FC6736" }}
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
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Email Input */}
          <Input
            type="email"
            placeholder="Surel"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-[50px] rounded-md border border-[#d9d5c7] bg-[#f9f8f3] px-4 text-[1.05rem] text-[#555333] placeholder:text-[#8a8877] focus:border-[#b8b39f] focus:ring-2 focus:ring-[#c8c3af]/35"
          />

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-[50px] w-full rounded-md border border-[#d9d5c7] bg-[#f9f8f3] px-4 py-2 pr-12 text-[1.05rem] text-[#555333] placeholder:text-[#8a8877] transition-colors focus:outline-none focus:border-[#b8b39f] focus:ring-2 focus:ring-[#c8c3af]/35"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-[#6f7280] hover:text-[#555333] transition-colors p-1"
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
              className="text-[0.94rem] italic text-[#555333]/80 hover:text-[#555333] transition-colors text-left"
            >
              Lupa?{" "}
              <span style={{ color: "#0088FF" }}>Atur ulang kata sandi</span>
            </Link>
          </div>

          {/* Terms Switch */}
          <label
            htmlFor="agreeTerms"
            className="login-terms-block block w-full cursor-pointer pt-1.5"
          >
            <span className="login-terms-row">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="right-find-master-toggle login-terms-switch login-terms-switch--login mt-[2px] shrink-0"
                aria-checked={agreed}
              />
              <span className="login-terms-copy text-[0.95rem] leading-[1.45] text-[#555333]/90">
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
            </span>
          </label>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!agreed || loading}
              className="h-[54px] min-w-[150px] rounded-full border border-[#cbc7b8] bg-[#bebaa6] px-7 text-[2rem] font-semibold tracking-tight text-[#F9F6EF] shadow-[0_0_0_2px_#e8e3d2,0_0_0_6px_#d9d3bf,inset_0_1px_0_rgba(255,255,255,0.45)] hover:bg-[#b5b198] active:bg-[#aba68d] disabled:opacity-100 disabled:bg-[#bebaa6] disabled:border-[#cbc7b8] disabled:text-[#F9F6EF]"
              style={{ borderRadius: "9999px" }}
            >
              {loading ? "Memuat..." : "Masuk Log"}
            </button>

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
