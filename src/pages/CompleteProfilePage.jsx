import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { API_BASE } from "../config";
import { useAuth } from "../AuthContext";
import SidebarNav from "../components/SidebarNav";
import { Alert, Button, Input, Modal, Skeleton } from "../components/ui";

export default function CompleteProfilePage() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isDateReadOnly, setIsDateReadOnly] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, refetchUser, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.profile_completed) {
      navigate("/");
      return;
    }

    setEmail(user.email);
    setUsername(user.username);

    const registrationMethod =
      location.state?.registrationMethod || user.registration_method;
    const dob = location.state?.dateOfBirth || user.date_of_birth;

    if (registrationMethod === "email" && dob) {
      setDateOfBirth(dob);
      setIsDateReadOnly(true);
    }

    if (location.state?.showSuccessModal) {
      setShowSuccessModal(true);
    }

    if (user.avatar) {
      setAvatarPreview(user.avatar);
    }

    setInitializing(false);
  }, [user, navigate, location]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !displayName || !dateOfBirth) {
      setError("Semua field harus diisi");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("username", username);
      formData.append("display_name", displayName);
      formData.append("date_of_birth", dateOfBirth);

      if (avatar) {
        formData.append("avatar", avatar);
      }

      const response = await fetch(`${API_BASE}/api/auth/complete-profile/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        await refetchUser();
        navigate("/");
      } else {
        setError(data.error || "Gagal melengkapi profil");
      }
    } catch (error) {
      console.error("Complete profile error:", error);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch(`${API_BASE}/api/auth/logout/`, {
          method: "POST",
          headers: { Authorization: `Token ${token}` },
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    logout();
    navigate("/login");
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#f7f5ef]">
        <div className="mx-auto grid w-[98%] grid-cols-1 gap-4 py-4 md:grid-cols-12">
          <div className="hidden md:col-span-3 md:block lg:col-span-2">
            <Skeleton height="h-[78vh]" />
          </div>
          <div className="space-y-4 md:col-span-9 lg:col-span-10">
            <Skeleton height="h-8" />
            <Skeleton height="h-6" />
            <Skeleton height="h-64" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5ef]">
      <Modal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Pendaftaran Berhasil"
        size="md"
        footer={
          <Button
            className="bg-[#6b7b6e] hover:bg-[#5a6a5d] active:bg-[#4d5b4f]"
            onClick={() => setShowSuccessModal(false)}
          >
            Lanjutkan
          </Button>
        }
      >
        <div className="py-2 text-center">
          <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#6b7b6e] text-[#6b7b6e]">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <p className="text-sm text-neutral-600">
            Sila lengkapi informasi akun Anda.
          </p>
        </div>
      </Modal>

      <div className="mx-auto grid w-[98%] grid-cols-1 gap-4 py-4 md:grid-cols-12">
        <aside className="hidden border-r border-[#dfddd4] bg-[#f7f5ef] p-4 md:col-span-3 md:block lg:col-span-2">
          <SidebarNav />
        </aside>

        <main className="md:col-span-9 lg:col-span-10">
          <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-7">
            <div className="mb-6">
              <h2 className="mb-2 text-3xl font-bold text-neutral-900">
                Buat Akun
              </h2>
              <p className="text-neutral-600">
                Tetapkan nama pengguna, nama tampilan, tanggal lahir, dan unggah
                foto profil.
              </p>
            </div>

            {error && (
              <div className="mb-5">
                <Alert
                  type="danger"
                  message={error}
                  onClose={() => setError("")}
                />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Input
                    type="text"
                    id="username"
                    label="Nama Pengguna"
                    placeholder="namapengguna"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <small className="text-xs text-neutral-500">
                    5-12 karakter, tidak dapat diubah setelah terbikin{" "}
                    <span className="font-medium text-telisik">
                      {username.length > 0 ? username.length : 0}
                    </span>
                  </small>
                </div>

                <div className="space-y-2">
                  <Input
                    type="text"
                    id="displayName"
                    label="Nama Tampilan"
                    placeholder="Nama Tampilan"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={30}
                    required
                  />
                  <small className="text-xs text-neutral-500">
                    Nama lengkap, maksimal 30 karakter{" "}
                    <span className="font-medium text-telisik">
                      {displayName.length}
                    </span>
                  </small>
                </div>
              </div>

              <div className="h-px w-full bg-neutral-200" />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Input
                    type="date"
                    id="dateOfBirth"
                    label="Tanggal Lahir"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    readOnly={isDateReadOnly}
                    className={
                      isDateReadOnly ? "bg-neutral-100 cursor-not-allowed" : ""
                    }
                    required
                  />
                  <small className="text-xs italic text-neutral-500">
                    Tanggal lahir akan tersembunyi dari publik.
                  </small>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Surel
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      className="w-full cursor-not-allowed rounded-lg border-2 border-gray-300 bg-neutral-100 px-3 py-2 text-sm text-neutral-700"
                      value={email}
                      readOnly
                    />
                    {user?.avatar && (
                      <div className="absolute right-3 top-1/2 h-8 w-8 -translate-y-1/2 overflow-hidden rounded-full">
                        <img
                          src={user.avatar}
                          alt="Avatar"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <Link
                    to="/change-email"
                    className="text-sm text-cyan-700 transition-colors hover:text-cyan-800"
                  >
                    Ganti alamat surel
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                <label
                  htmlFor="avatarUpload"
                  className="text-sm font-medium text-gray-700"
                >
                  Foto Profil
                </label>
                <div className="flex flex-col items-start gap-3 md:flex-row md:items-center">
                  <div className="h-20 w-20 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Preview Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-neutral-500">
                        No Photo
                      </div>
                    )}
                  </div>
                  <div className="w-full md:w-auto">
                    <input
                      type="file"
                      id="avatarUpload"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-200 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-neutral-700 hover:file:bg-neutral-300"
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      Format gambar JPG/PNG, disarankan rasio 1:1.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-neutral-600 hover:bg-neutral-100"
                  onClick={handleLogout}
                >
                  Keluar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  loading={loading}
                  className="rounded-full bg-[#c5c4bb] px-8 py-3 text-neutral-900 hover:bg-[#a8a79f] active:bg-[#97968e]"
                >
                  {loading ? "Menyimpan..." : "Simpan & Buat Akun"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
