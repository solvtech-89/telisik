import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { API_BASE } from "../config";
import { useAuth } from "../AuthContext";
import Alert from "../components/ui/Alert";

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const pad2 = (value) => String(value).padStart(2, "0");
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const WHEEL_ROW_HEIGHT = 32;
const WHEEL_VISIBLE_ROWS = 7;
const WHEEL_SPACER_HEIGHT = ((WHEEL_VISIBLE_ROWS - 1) / 2) * WHEEL_ROW_HEIGHT;

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
  const [isBirthPickerOpen, setIsBirthPickerOpen] = useState(false);
  const [tempDay, setTempDay] = useState(1);
  const [tempMonth, setTempMonth] = useState(1);
  const [tempYear, setTempYear] = useState(new Date().getFullYear() - 17);
  const dayWheelRef = useRef(null);
  const monthWheelRef = useRef(null);
  const yearWheelRef = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const currentYear = new Date().getFullYear();
  const maxAllowedYear = currentYear - 17;
  const minAllowedYear = currentYear - 90;
  const selectedDayCount = new Date(tempYear, tempMonth, 0).getDate();
  const dayOptions = Array.from({ length: selectedDayCount }, (_, i) => i + 1);
  const monthOptions = MONTH_NAMES.map((month, i) => ({
    value: i + 1,
    label: month,
  }));
  const yearOptions = Array.from(
    { length: maxAllowedYear - minAllowedYear + 1 },
    (_, idx) => maxAllowedYear - idx,
  );

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

  const openBirthPicker = () => {
    if (birthDate) {
      const [yyyy, mm, dd] = birthDate.split("-").map(Number);
      if (yyyy && mm && dd) {
        setTempYear(Math.min(Math.max(yyyy, minAllowedYear), maxAllowedYear));
        setTempMonth(mm);
        setTempDay(dd);
      }
    }
    setIsBirthPickerOpen(true);
  };

  const scrollWheelToValue = (ref, optionsLength, valueIndex) => {
    if (!ref.current) return;
    const safeIndex = clamp(valueIndex, 0, optionsLength - 1);
    ref.current.scrollTo({
      top: safeIndex * WHEEL_ROW_HEIGHT,
      behavior: "auto",
    });
  };

  const closeBirthPicker = () => {
    setIsBirthPickerOpen(false);
  };

  const applyBirthPicker = () => {
    const safeDay = Math.min(
      tempDay,
      new Date(tempYear, tempMonth, 0).getDate(),
    );
    setBirthDate(`${tempYear}-${pad2(tempMonth)}-${pad2(safeDay)}`);
    setIsBirthPickerOpen(false);
  };

  useEffect(() => {
    setTempDay((day) => Math.min(day, selectedDayCount));
  }, [selectedDayCount]);

  useEffect(() => {
    if (!isBirthPickerOpen) return;

    scrollWheelToValue(dayWheelRef, dayOptions.length, tempDay - 1);
    scrollWheelToValue(monthWheelRef, monthOptions.length, tempMonth - 1);
    scrollWheelToValue(
      yearWheelRef,
      yearOptions.length,
      yearOptions.findIndex((year) => year === tempYear),
    );
  }, [
    isBirthPickerOpen,
    tempDay,
    tempMonth,
    tempYear,
    dayOptions.length,
    monthOptions.length,
    yearOptions,
  ]);

  const handleWheelScroll = (event, options, onSelect) => {
    const index = clamp(
      Math.round(event.currentTarget.scrollTop / WHEEL_ROW_HEIGHT),
      0,
      options.length - 1,
    );
    onSelect(options[index]);
  };

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
    <div className="min-h-screen px-4" style={{ background: "inherit" }}>
      <div className="mx-auto w-full max-w-[620px] pb-12">
        <div className="flex items-center justify-between pt-4 md:pt-5">
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
              className="register-cancel-btn register-cancel-btn--top"
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
        <div className="pt-9 pb-6 md:pt-10 md:pb-7">
          <h1 className="text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.01em] text-[#555333]">
            Buat akun baru
          </h1>
          <p className="mt-1.5 text-[1.05rem] text-[#555333]/90">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#FC6736] hover:text-[#e0592d] transition-colors"
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
        <form onSubmit={handleSubmit} className="w-full space-y-5 md:space-y-6">
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:gap-5">
            {/* Email Input */}
            <div className="w-full min-w-0 flex-1 sm:w-1/2">
              <label className="mb-2 block text-[1rem] font-semibold text-[#555333] whitespace-nowrap">
                Tulis surel
              </label>
              <input
                type="email"
                placeholder="Tulis surel"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block h-[46px] w-full min-w-0 rounded-none border border-[#dfe1dd] bg-[#f9f8f3] px-3.5 text-[0.98rem] text-[#555333] placeholder:text-[#9a9888] focus:outline-none focus:border-[#82b7ff] focus:ring-2 focus:ring-[#82b7ff]/20"
              />
            </div>

            {/* Birth Date Input */}
            <div className="relative w-full min-w-0 flex-1 sm:w-1/2">
              <label className="mb-2 block text-[1rem] font-semibold text-[#555333] whitespace-nowrap">
                Tanggal lahir
              </label>
              <button
                type="button"
                onClick={openBirthPicker}
                className="flex h-[46px] w-full items-center justify-between border border-[#82b7ff] bg-[#f9f8f3] px-3.5 text-left text-[0.98rem] text-[#0088FF]"
              >
                <span>
                  {birthDate
                    ? `${birthDate.split("-")[2]}/${birthDate.split("-")[1]}/${birthDate.split("-")[0]}`
                    : "Tetapkan tanggal lahir"}
                </span>
                <span className="text-[#0088FF]">
                  {isBirthPickerOpen ? "⌃" : "⌄"}
                </span>
              </button>
              <p className="text-[0.78rem] text-[#7f7d6f] italic">
                Tanggal lahir akan tersembunyi dari publik
              </p>

              {isBirthPickerOpen && (
                <div className="absolute right-0 top-[74px] z-30 w-[460px] max-w-[calc(100vw-2rem)] border border-[#dedede] bg-[#f9f8f3] p-4 shadow-lg">
                  <div className="mb-2 text-center text-[1rem] font-semibold text-[#ff3f6e]">
                    Usia minimal 17 tahun saat mendaftar
                  </div>
                  <div className="mb-3 text-center text-[0.84rem] italic text-[#888475]">
                    Pilih tanggal, lalu "Tetapkan"
                  </div>

                  <div className="relative rounded-md border border-[#e5e2d8] bg-[#f9f8f3] px-2 py-1">
                    <div
                      className="pointer-events-none absolute left-1 right-1 top-1/2 z-0 -translate-y-1/2 rounded-full border border-[#1480ff] bg-[#f6fbff]/90"
                      style={{ height: `${WHEEL_ROW_HEIGHT}px` }}
                    />
                    <div
                      className="relative z-10 grid gap-0"
                      style={{
                        gridTemplateColumns: "88px minmax(160px,1fr) 104px",
                      }}
                    >
                      <div
                        ref={dayWheelRef}
                        onScroll={(e) =>
                          handleWheelScroll(e, dayOptions, setTempDay)
                        }
                        className="min-w-0 overflow-x-hidden overflow-y-auto"
                        style={{
                          height: `${WHEEL_VISIBLE_ROWS * WHEEL_ROW_HEIGHT}px`,
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                          scrollSnapType: "y mandatory",
                        }}
                      >
                        <div style={{ height: `${WHEEL_SPACER_HEIGHT}px` }} />
                        {dayOptions.map((day) => (
                          <button
                            key={`day-${day}`}
                            type="button"
                            onClick={() => setTempDay(day)}
                            className={`block w-full border-b border-[#ece9df] px-2 text-center text-[1rem] leading-[1.25] ${day === tempDay ? "font-semibold text-[#0088FF]" : "text-[#6b684f]"}`}
                            style={{
                              height: `${WHEEL_ROW_HEIGHT}px`,
                              scrollSnapAlign: "start",
                            }}
                          >
                            {day}
                          </button>
                        ))}
                        <div style={{ height: `${WHEEL_SPACER_HEIGHT}px` }} />
                      </div>

                      <div
                        ref={monthWheelRef}
                        onScroll={(e) =>
                          handleWheelScroll(e, monthOptions, (opt) =>
                            setTempMonth(opt.value),
                          )
                        }
                        className="min-w-0 overflow-x-hidden overflow-y-auto"
                        style={{
                          height: `${WHEEL_VISIBLE_ROWS * WHEEL_ROW_HEIGHT}px`,
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                          scrollSnapType: "y mandatory",
                        }}
                      >
                        <div style={{ height: `${WHEEL_SPACER_HEIGHT}px` }} />
                        {monthOptions.map((month) => (
                          <button
                            key={`month-${month.value}`}
                            type="button"
                            onClick={() => setTempMonth(month.value)}
                            className={`block w-full border-b border-[#ece9df] px-2 text-center text-[1rem] leading-[1.25] whitespace-nowrap ${month.value === tempMonth ? "font-semibold text-[#0088FF]" : "text-[#6b684f]"}`}
                            style={{
                              height: `${WHEEL_ROW_HEIGHT}px`,
                              scrollSnapAlign: "start",
                            }}
                          >
                            {month.label}
                          </button>
                        ))}
                        <div style={{ height: `${WHEEL_SPACER_HEIGHT}px` }} />
                      </div>

                      <div
                        ref={yearWheelRef}
                        onScroll={(e) =>
                          handleWheelScroll(e, yearOptions, setTempYear)
                        }
                        className="min-w-0 overflow-x-hidden overflow-y-auto"
                        style={{
                          height: `${WHEEL_VISIBLE_ROWS * WHEEL_ROW_HEIGHT}px`,
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                          scrollSnapType: "y mandatory",
                        }}
                      >
                        <div style={{ height: `${WHEEL_SPACER_HEIGHT}px` }} />
                        {yearOptions.map((year) => (
                          <button
                            key={`year-${year}`}
                            type="button"
                            onClick={() => setTempYear(year)}
                            className={`block w-full border-b border-[#ece9df] px-2 text-center text-[1rem] leading-[1.25] whitespace-nowrap ${year === tempYear ? "font-semibold text-[#0088FF]" : "text-[#6b684f]"}`}
                            style={{
                              height: `${WHEEL_ROW_HEIGHT}px`,
                              scrollSnapAlign: "start",
                            }}
                          >
                            {year}
                          </button>
                        ))}
                        <div style={{ height: `${WHEEL_SPACER_HEIGHT}px` }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={closeBirthPicker}
                      className="register-cancel-btn register-cancel-btn--picker"
                    >
                      Batalkan
                    </button>
                    <button
                      type="button"
                      onClick={applyBirthPicker}
                      className="h-10 min-w-[118px] rounded-full border border-[#8a8868] bg-[#6f6c45] px-5 text-[1rem] font-semibold text-[#F9F6EF]"
                    >
                      Tetapkan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col gap-4 sm:flex-row sm:gap-5">
            {/* Password Input */}
            <div className="relative w-full min-w-0 flex-1 sm:w-1/2">
              <div className="w-full min-w-0">
                <label className="mb-2 block text-[1rem] font-semibold text-[#555333] whitespace-nowrap">
                  Buat kata sandi
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Buat kata sandi"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                    className="block h-[46px] w-full min-w-0 rounded-none border border-[#dfe1dd] bg-[#f9f8f3] px-3.5 py-2 pr-10 text-[0.98rem] text-[#555333] placeholder:text-[#9a9888] transition-colors focus:outline-none focus:border-[#82b7ff] focus:ring-2 focus:ring-[#82b7ff]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 text-[#7e8190] hover:text-[#555333] transition-colors p-1"
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
            <div className="relative w-full min-w-0 flex-1 sm:w-1/2">
              <div className="w-full min-w-0">
                <label className="mb-2 block text-[1rem] font-semibold text-[#555333] whitespace-nowrap">
                  Ketik ulang kata sandi
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ketik ulang kata sandi"
                    value={confirmPassword}
                    onChange={(e) =>
                      handleConfirmPasswordChange(e.target.value)
                    }
                    required
                    className={`block h-[46px] w-full min-w-0 rounded-none border bg-[#f9f8f3] px-3.5 py-2 pr-10 text-[0.98rem] placeholder:text-[#9a9888] focus:outline-none focus:ring-2 transition-colors ${
                      passwordsMatch
                        ? "border-[#dfe1dd] text-[#555333] focus:border-[#82b7ff] focus:ring-[#82b7ff]/20"
                        : "border-danger-300 text-[#555333] focus:border-danger-600 focus:ring-danger-100"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 text-[#7e8190] hover:text-[#555333] transition-colors p-1"
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
          <div className="flex w-full items-start gap-3 pt-2">
            <span className="inline-flex h-[1.55rem] w-[34px] flex-shrink-0 items-center">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="right-find-master-toggle login-terms-switch shrink-0"
              />
            </span>
            <div className="min-w-0 flex-1">
              <label
                htmlFor="agreeTerms"
                className="block w-full text-[1rem] text-[#555333]/90 cursor-pointer leading-[1.5]"
              >
                Saya sudah membaca, memahami, dan menyetujui{" "}
                <Link
                  to="/pages/terms-and-conditions"
                  className="text-[#0088FF] hover:underline"
                  style={{ color: "#0088FF" }}
                >
                  Syarat & Ketentuan
                </Link>{" "}
                serta{" "}
                <Link
                  to="/pages/privacy-policy"
                  className="text-[#0088FF] hover:underline"
                  style={{ color: "#0088FF" }}
                >
                  Kebijakan Privasi
                </Link>{" "}
                Telisik.
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!agreed || !passwordsMatch || loading}
              className="h-[48px] min-w-[188px] rounded-full border border-[#cbc7b8] bg-[#bebaa6] px-9 text-[1.08rem] font-semibold tracking-tight text-[#F9F6EF] shadow-[0_0_0_2px_#e8e3d2,0_0_0_6px_#d9d3bf,inset_0_1px_0_rgba(255,255,255,0.45)] transition-all duration-150 hover:bg-[#b5b198] active:bg-[#aba68d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ea58d]/50 disabled:opacity-100 disabled:bg-[#bebaa6] disabled:border-[#cbc7b8] disabled:text-[#F9F6EF]"
              style={{ borderRadius: "9999px" }}
            >
              {loading ? "Memuat..." : "Daftar Sekarang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
