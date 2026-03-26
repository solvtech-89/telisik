import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ICONS, API_BASE } from "../config";
import { useAuth } from "../AuthContext";

const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
};

export default function HomeNav() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("beranda");
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = !!user;

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        await fetch(`${API_BASE}/api/auth/logout/`, {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
          },
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    logout(); // Clear local state
    navigate("/login");
  };

  useEffect(() => {
    // Fetch feed items for "Feed Tanggapan" section
    const fetchFeedItems = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/feed/`);
        const data = await response.json();
        setFeedItems(data || []);
      } catch (err) {
        console.error("Failed to fetch feed items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedItems();
  }, []);

  const menuItems = [
    { id: "akun-saya", label: "Akun Saya", key: "user", requiresAuth: true },
    { id: "sumbangsih", label: "Sumbangsih", key: "edit", requiresAuth: true },
    {
      id: "tentang-telisik",
      label: "Tentang Telisik",
      key: "info",
      requiresAuth: false,
    },
    {
      id: "bantuan-dukungan",
      label: "Bantuan & Dukungan",
      key: "help",
      requiresAuth: false,
    },
  ];

  if (authLoading) {
    return (
      <div
        className="p-2 flex justify-center items-center"
        style={{ height: "100%" }}
      >
        <div
          className="w-6 h-6 border-2 border-gray-300 rounded-full border-t-gray-600 animate-spin"
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2" style={{ overflowY: "auto", height: "100%" }}>
      {/* Header Section */}
      <div className="nav-header mb-4">
        {isLoggedIn ? (
          <div>
            <Link to="/profile">
              <div className="flex items-center mb-3">
                <div
                  className="rounded-full mr-3 overflow-hidden"
                  style={{
                    width: "48px",
                    height: "48px",
                    backgroundImage: `url(${user.avatar || "/default-avatar.png"})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div>
                  <h3 className="mt-0 mb-0 font-bold text-gray-900">
                    {user.first_name || user.username}
                  </h3>
                  <small className="text-gray-500">{user.email}</small>
                </div>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-sm text-red-600 border border-red-600 rounded px-3 py-2 text-center"
            >
              Keluar
            </button>
          </div>
        ) : (
          <Link to="/login" className="no-underline">
            <div className="flex items-center mb-3">
              <div
                className="rounded-full flex items-center justify-center mr-3 overflow-hidden"
                style={{ width: "48px", height: "48px" }}
              >
                <img src="/login.svg" className="mr-2" alt="Login" />
              </div>
              <div>
                <h3 className="mt-3 mb-0 font-bold text-gray-900">
                  Sila Masuk/Mendaftar
                </h3>
                <small className="text-gray-500">
                  Sunting profil mu, terlibatlah
                </small>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Navigation Menu */}
      <nav>
        <ul className="list-none p-0 m-0">
          {menuItems.map((item) => {
            const isDisabled = item.requiresAuth && !isLoggedIn;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`flex items-center p-0 text-sm ${
                    activeMenu === item.id
                      ? "font-bold text-gray-900"
                      : "text-gray-700"
                  }`}
                  onClick={() => !isDisabled && setActiveMenu(item.id)}
                  disabled={isDisabled}
                  style={{
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    color: isDisabled ? "#706f5eff" : "inherit",
                  }}
                >
                  <span
                    className="mr-2"
                    dangerouslySetInnerHTML={{
                      __html: ICONS[item.key] || ICONS.h1,
                    }}
                    style={{
                      opacity: isDisabled ? 0.4 : 1,
                    }}
                  />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Feed Section */}
      <div className="feed-section mt-4">
        <h6 className="font-semibold text-gray-500 mb-3">
          <span className="text-danger">❤️</span> (Feed Tanggapan)
        </h6>

        {loading ? (
          <div className="text-center py-4">
            <div
              className="w-4 h-4 border-2 border-gray-300 rounded-full border-t-gray-600 animate-spin mx-auto"
              role="status"
            >
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : feedItems.length > 0 ? (
          feedItems.map((item, index) => (
            <div key={index} className="mb-3 bg-transparent">
              <div className="p-3">
                {/* User Info */}
                <div className="flex items-start mb-2">
                  <div
                    className="rounded-full bg-warning mr-2"
                    style={{ width: "24px", height: "24px", minWidth: "24px" }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="font-semibold text-sm mr-2">
                        {item.display_name || "Display Name"}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {item.timestamp || "00m"}
                      </span>
                    </div>
                    <h6 className="mb-2 text-sm">
                      {truncateText(item.title, 60)}
                    </h6>
                    <p
                      className="text-gray-500 text-sm mb-2"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {truncateText(item.content, 120)}
                    </p>
                  </div>
                </div>
                {/* Image Preview */}
                {item.image && (
                  <div className="mb-2">
                    <img
                      src={item.image}
                      alt="preview"
                      className="w-full h-auto rounded"
                      style={{
                        maxHeight: "100px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
                {/* Thumbnails Row */}
                {item.thumbnails && item.thumbnails.length > 0 && (
                  <div className="flex gap-2 mb-2">
                    {item.thumbnails.slice(0, 3).map((thumb, idx) => (
                      <div
                        key={idx}
                        className="bg-warning rounded"
                        style={{
                          width: "60px",
                          height: "60px",
                          backgroundImage: thumb ? `url(${thumb})` : "none",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                    ))}
                  </div>
                )}
                {/* Footer Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 text-gray-500 text-sm">
                    <span>👁️ {item.views || "9.999"}</span>
                    <span>💬 {item.comments || "9.999"}</span>
                  </div>
                  <button className="text-sm text-gray-600 border border-gray-300 rounded px-2 py-1">
                    Tanggapi
                  </button>
                </div>
                className="bg-yellow-400 rounded"
                {item.messages && item.messages.length > 0 && (
                  <div className="mt-3 pt-3 border-top">
                    <div className="mb-2">
                      <span className="text-primary text-sm">
                        Merespon #{item.messages[0].id || "000000-000"}
                      </span>
                    </div>
                    {item.messages.map((msg, msgIdx) => (
                      <div key={msgIdx} className="mb-2">
                        <div className="flex items-start">
                          <div
                            className="rounded-full bg-blue-300 mr-2"
                            style={{
                              width: "20px",
                              height: "20px",
                              minWidth: "20px",
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <span className="font-semibold text-sm mr-2">
                                {msg.display_name || "Display Name"}
                              </span>
                              <span className="text-gray-500 text-sm">
                                {msg.timestamp || "00m"}
                              </span>
                            </div>
                            <p
                              className="text-gray-500 text-sm mb-0"
                              style={{ fontSize: "0.85rem" }}
                            >
                              {truncateText(msg.content, 100)}
                              {msg.emoji && (
                                <span className="ml-1">{msg.emoji}</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Show more messages */}
                {item.hasMoreMessages && (
                  <div className="text-center mt-2">
                    <button className="text-sm text-gray-500 p-0">
                      Menampilkan lainnya ↓
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="mb-3 bg-transparent border-0">
            <div className="p-3">
              <div className="flex items-start mb-2">
                <div
                  className="rounded-full bg-yellow-400 mr-2"
                  style={{ width: "24px", height: "24px", minWidth: "24px" }}
                />
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="font-semibold text-sm mr-2">
                      Display Name
                    </span>
                    <span className="text-gray-500 text-sm">00m</span>
                  </div>
                  <h6 className="mb-2 text-sm">
                    Heading (Opsional) Maksimal 60 Karakter Lorem Ipsum Dolor
                  </h6>
                  <p
                    className="text-gray-500 text-sm mb-2"
                    style={{ fontSize: "0.85rem" }}
                  >
                    Donec eget quam bibendum, verius eleifend feugiat metus.
                    Fusce pellentesque diam nunc bibendum est finibus nulla eget
                    molestie enim.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mb-2">
                {[1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="bg-yellow-400 rounded"
                    style={{ width: "60px", height: "60px" }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-3 text-gray-500 text-sm">
                  <span>👁️ 9.999</span>
                  <span>💬 9.999</span>
                </div>
                <button className="text-sm border border-gray-300 rounded px-2 py-1">
                  Tanggapi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
