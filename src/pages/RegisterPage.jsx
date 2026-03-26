import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { API_BASE } from "../config";
import { useAuth } from "../AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (confirmPassword) {
      setPasswordsMatch(value === confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    setPasswordsMatch(password === value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("Silakan setujui Syarat & Ketentuan dan Kebijakan Privasi");
      return;
    }

    if (password !== confirmPassword) {
      setError("Kata sandi tidak cocok");
      setPasswordsMatch(false);
      return;
    }

    if (password.length < 8) {
      setError("Kata sandi harus minimal 8 karakter");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          birth_date: birthDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/verify-otp", {
          state: {
            userId: data.user_id,
            email: data.email,
          },
        });
      } else {
        setError(data?.error || "Pendaftaran gagal");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Terjadi kesalahan saat pendaftaran");
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-neutral-50">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">
            Buat akun baru
          </h1>
          <p className="text-neutral-600">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="font-semibold text-telisik hover:text-telisik-dark transition-colors"
            >
              Masuk Log →
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Email Input */}
            <Input
              type="email"
              label="Email"
              placeholder="tulis@surel.mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Birth Date Input */}
            <div className="flex flex-col gap-2">
              <Input
                type="date"
                label="Tanggal Lahir"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 italic">
                Tanggal lahir akan tersembunyi dari publik
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Password Input */}
            <div className="relative flex items-end">
              <div className="w-full">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Kata Sandi <span className="text-danger-600">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Buat kata sandi"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-telisik focus:ring-2 focus:ring-telisik/10 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-500 hover:text-gray-700 transition-colors p-1"
                    aria-label="Toggle password visibility"
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
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="relative flex items-end">
              <div className="w-full">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Ulangi Kata Sandi <span className="text-danger-600">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ketik ulang kata sandi"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    required
                    className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      passwordsMatch
                        ? "border-gray-300 focus:border-telisik focus:ring-telisik/10"
                        : "border-danger-300 focus:border-danger-600 focus:ring-danger-100"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-gray-500 hover:text-gray-700 transition-colors p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? (
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
                {!passwordsMatch && confirmPassword && (
                  <p className="text-xs text-danger-600 mt-1">
                    Kata sandi tidak cocok
                  </p>
                )}
              </div>
            </div>
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
            disabled={!agreed || !passwordsMatch || loading}
            loading={loading}
            className="rounded-full"
          >
            Daftar Sekarang
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-xs text-gray-500">atau</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Google Register Button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() =>
                setError("Google registration gagal. Silakan coba lagi.")
              }
              text="signup_with"
              shape="pill"
              width="100%"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
