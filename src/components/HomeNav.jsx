import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ICONS, API_BASE } from "../config";
import UserBadge from "./UserBadge";
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
      <div className="flex h-full items-center justify-center p-2">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-2">
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
              className="w-full rounded border border-red-600 px-3 py-2 text-center text-sm text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
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
                <h5 className="mt-3 mb-0 font-bold text-gray-900">
                  Sila Masuk/Mendaftar
                </h5>
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
        <ul className="m-0 list-none p-0">
          {menuItems.map((item) => {
            const isDisabled = item.requiresAuth && !isLoggedIn;
            return (
              <li key={item.id} className="mb-1">
                <button
                  type="button"
                  className={`flex w-full items-center rounded-md px-2 py-1.5 text-sm transition-colors ${
                    isDisabled
                      ? "cursor-not-allowed text-[#706f5e] opacity-70"
                      : activeMenu === item.id
                        ? "bg-gray-100 font-semibold text-gray-900"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
                  }`}
                  onClick={() => !isDisabled && setActiveMenu(item.id)}
                  disabled={isDisabled}
                >
                  <span
                    className={`mr-2 ${isDisabled ? "opacity-40" : "opacity-100"}`}
                    dangerouslySetInnerHTML={{
                      __html: ICONS[item.key] || ICONS.h1,
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
          <span className="text-red-500">❤️</span> (Feed Tanggapan)
        </h6>

        {loading ? (
          <div className="text-center py-4">
            <div
              className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"
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
                  <UserBadge
                    name={item.display_name || "Display Name"}
                    avatar={item.avatar || ""}
                    time={item.timestamp || "00m"}
                    size={24}
                    nameSize="0.78rem"
                    timeSize="0.65rem"
                    nameColor="#1f2937"
                  />
                  <div style={{ flexBasis: 0, flexGrow: 1 }}>
                    <h6 className="mb-2 text-sm">
                      {truncateText(item.title, 60)}
                    </h6>
                    <p className="mb-2 text-[0.85rem] text-gray-500">
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
                      className="h-auto max-h-[100px] w-full rounded object-cover"
                    />
                  </div>
                )}
                {/* Thumbnails Row */}
                {item.thumbnails && item.thumbnails.length > 0 && (
                  <div className="flex gap-2 mb-2">
                    {item.thumbnails.slice(0, 3).map((thumb, idx) => (
                      <div
                        key={idx}
                        className="h-[60px] w-[60px] rounded bg-yellow-400"
                        style={{
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
                  <button className="rounded border border-gray-300 px-2 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30">
                    Tanggapi
                  </button>
                </div>
                {item.messages && item.messages.length > 0 && (
                  <div className="mt-3 border-t border-gray-200 pt-3">
                    <div className="mb-2">
                      <span className="text-sm text-blue-600">
                        Merespon #{item.messages[0].id || "000000-000"}
                      </span>
                    </div>
                    {item.messages.map((msg, msgIdx) => (
                      <div key={msgIdx} className="mb-2">
                        <div className="flex items-start">
                          <UserBadge
                            name={msg.display_name || "Display Name"}
                            avatar={msg.avatar || ""}
                            time={msg.timestamp || "00m"}
                            size={20}
                            nameSize="0.78rem"
                            timeSize="0.65rem"
                            nameColor="#1f2937"
                          />
                          <div className="flex-1">
                            <p className="mb-0 text-[0.85rem] text-gray-500">
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
                    <button className="rounded px-1 py-0.5 text-sm text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30">
                      Menampilkan lainnya ↓
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="mb-3 bg-transparent">
            <div className="p-3">
              <div className="flex items-start mb-2">
                <div className="mr-2 h-6 w-6 shrink-0 rounded-full bg-yellow-400" />
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
                  <p className="mb-2 text-[0.85rem] text-gray-500">
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
                    className="h-[60px] w-[60px] rounded bg-yellow-400"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-3 text-gray-500 text-sm">
                  <span>👁️ 9.999</span>
                  <span>💬 9.999</span>
                </div>
                <button className="rounded border border-gray-300 px-2 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30">
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
