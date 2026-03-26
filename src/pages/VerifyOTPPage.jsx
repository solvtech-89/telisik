import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE } from "../config";
import { useAuth } from "../AuthContext";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const userId = location.state?.userId;
  const email = location.state?.email;

  useEffect(() => {
    if (!userId) {
      navigate("/register");
    }
  }, [userId, navigate]);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pastedData)) {
      return;
    }

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const lastIndex = Math.min(pastedData.length, 5);
    document.getElementById(`otp-${lastIndex}`).focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Masukkan kode OTP 6 digit");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/auth/verify-otp/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          otp_code: otpCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.access_token, data.user);
        navigate("/complete-profile", {
          state: {
            showSuccessModal: true,
            registrationMethod: data.user.registration_method,
            dateOfBirth: data.user.date_of_birth,
          },
        });
      } else {
        setError(data?.error || "Verifikasi gagal");
        if (data?.attempts_left !== undefined) {
          setAttemptsLeft(data.attempts_left);
        }

        if (data?.error?.includes("deleted")) {
          setTimeout(() => {
            navigate("/register");
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError("Terjadi kesalahan saat verifikasi");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("Fitur kirim ulang OTP belum tersedia");
  };

  const otpCode = otp.join("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-neutral-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">
            Verifikasi Email
          </h1>
          <p className="text-neutral-600 mb-1">
            Kami telah mengirimkan kode OTP 6 digit ke
          </p>
          <p className="font-semibold text-neutral-800 break-all">{email}</p>
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

        {/* Warning - Attempts Left */}
        {attemptsLeft < 3 && attemptsLeft > 0 && (
          <Alert
            type="warning"
            message={`Percobaan tersisa: ${attemptsLeft}/${3}`}
            className="mb-6"
          />
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Inputs */}
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-telisik focus:ring-2 focus:ring-telisik/10 transition-colors"
              />
            ))}
          </div>

          {/* Submit Button */}
          <Button
            fullWidth
            disabled={otpCode.length !== 6 || loading}
            loading={loading}
            className="rounded-lg"
          >
            {loading ? "Memverifikasi..." : "Verifikasi"}
          </Button>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Tidak menerima kode?</p>
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-telisik hover:text-telisik-dark underline text-sm font-medium transition-colors"
            >
              Kirim Ulang OTP
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">ℹ️ Informasi Penting:</span>
            <br />
            Kode OTP akan kedaluwarsa dalam 24 jam. Setelah 3 kali percobaan
            gagal, akun Anda akan dihapus dan Anda perlu mendaftar ulang.
          </p>
        </div>
      </div>
    </div>
  );
}
