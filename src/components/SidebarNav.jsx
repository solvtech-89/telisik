import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ICONS, API_BASE } from "../config";
import { useAuth } from "../AuthContext";
import ProfilePhotoModal from "./ProfilePhotoModal";
import "./SidebarNav.css";

const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
};

export default function SidebarNav({
  articleTOC = [],
  collapsed = false,
  onToggle,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [banners, setBanners] = useState();
  const [hasMore, setHasMore] = useState(false);
  const [akunExpanded, setAkunExpanded] = useState(true);
  const [sumbangsihExpanded, setsumbangsihExpanded] = useState(false);

  const isLoggedIn = !!user;
  const isArticlePage = /^(\/article\/[^/]+\/[^/]+|\/urun-daya(\/.*)?)$/.test(
    location.pathname,
  );
  const showTOC = isArticlePage && articleTOC.length > 0;

  const fetchFeedItems = async (page = 1, append = false) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/latest-comments/?page=${page}&limit=10`,
      );
      const data = await response.json();

      if (append) {
        setFeedItems((prev) => [...prev, ...(data.results || [])]);
      } else {
        setFeedItems(data.results || []);
      }

      setHasMore(data.has_next || false);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to fetch feed items:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchFeedItems(1);
  }, []);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchFeedItems(currentPage + 1, true);
    }
  };

  const getArticleUrl = (item) => {
    if (item.object_type === "diskursus") {
      return `/diskursus/${item.article_slug}`;
    }
    return `/article/${item.article_type}/${item.article_slug}`;
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isAnyChildActive = (paths) => {
    return paths.some((path) => location.pathname === path);
  };

  const akunChildPaths = ["/complete-profile", "/settings"];
  const sumbangsihChildPaths = [
    "/kronik",
    "/tilik",
    "/diskursus",
    "/tanggapan",
  ];
  const isAkunActive = isAnyChildActive(akunChildPaths);
  const isSumbangsihActive = isAnyChildActive(sumbangsihChildPaths);

  useEffect(() => {
    fetchSidebarData();
  }, []);

  const fetchSidebarData = async () => {
    try {
      setLoading(true);

      const bannersRes = await fetch(`${API_BASE}/api/banners/`);

      if (!bannersRes.ok) {
        throw new Error("Failed to fetch sidebar data");
      }

      const bannersData = bannersRes.json();
      setBanners(bannersData.banners || []);
    } catch (error) {
      console.error("Error fetching sidebar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBannerByPosition = (position) => {
    if (banners) {
      const valid = banners.filter(
        (b) => b.position === position && new Date(b.expires_at) > new Date(),
      );
      return valid.length > 0
        ? valid[Math.floor(Math.random() * valid.length)]
        : null;
    }
  };
  const bannerLeft = getBannerByPosition("sidebar_top");

  function timeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const seconds = Math.floor((now - past) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const counter = Math.floor(seconds / secondsInUnit);

      if (counter >= 1) {
        if (unit === "second" && counter < 10) return "just now";

        const unitLabel = counter === 1 ? unit : unit + "s";
        return `${counter} ${unitLabel} ago`;
      }
    }

    return "just now";
  }

  return (
    <>
      <div className="pt-3 pb-3 sidebar-root hidden md:block">
        {isLoggedIn ? (
          <div className="text-left mb-4">
            <div
              className="profile-photo-btn mb-2"
              onClick={() => setShowPhotoModal(true)}
              style={{ cursor: "pointer" }}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Foto profil"
                  style={{
                    width: collapsed ? "40px" : "112px",
                    height: collapsed ? "40px" : "112px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    transition: "all 0.3s ease",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: collapsed ? "40px" : "112px",
                    height: collapsed ? "40px" : "112px",
                    borderRadius: "50%",
                    backgroundColor: "#e0e0e0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    transition: "all 0.3s ease",
                  }}
                >
                  <span dangerouslySetInnerHTML={{ __html: ICONS.user }} />
                </div>
              )}
            </div>
            {!collapsed && (
              <>
                <div className="font-semibold">
                  {user.display_name || "Display Name"}
                </div>
                <div className="text-gray-500 text-sm">
                  @{user.username || "username"}
                </div>
              </>
            )}
          </div>
        ) : (
          <div
            className="text-left mb-4 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            <img
              src="/login.svg"
              alt="Login"
              className={collapsed ? "w-10 h-10" : "w-20 h-20 mb-2"}
              style={{ transition: "all 0.3s ease" }}
            />
            {!collapsed && (
              <>
                <div className="font-semibold">Sila Masuk/Mendaftar</div>
                <div className="text-gray-500 small">Sumbangsihmu ditunggu</div>
              </>
            )}
          </div>
        )}

        <hr className="mb-3 border-t" />

        {showTOC && !collapsed && (
          <>
            <nav>
              <ul className="list-none pl-0 text-left">
                {articleTOC.map((it) => (
                  <li
                    key={it.id}
                    className="mb-2 flex justify-between withborder"
                  >
                    <button
                      type="button"
                      className="p-0 flex items-center w-full justify-start no-underline btn-leftnav"
                      onClick={() => {
                        const target = document.getElementById(
                          `section-${it.key}`,
                        );
                        const middleCol =
                          document.getElementById("middle-col-scroll");
                        if (target && middleCol) {
                          middleCol.scrollTo({
                            top: target.offsetTop - 40,
                            behavior: "smooth",
                          });
                        }
                      }}
                    >
                      <span className="mr-2">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11.2729 14.7466C12.763 15.5524 15.533 15.0539 15.533 12.5693C15.533 10.7356 13.9523 9.81612 12.0504 8.91521C10.1484 8.01431 9.00293 7.15273 9.00293 5.49735C9.00293 3.84196 10.3449 2.5 12.0003 2.5C13.263 2.5 14.3434 3.28088 14.7849 4.38609"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                          />
                          <path
                            d="M12.7276 9.25344C11.2375 8.44756 8.46746 8.94611 8.46746 11.4307C8.46746 13.2644 10.0482 14.1839 11.9501 15.0848C13.852 15.9857 14.9976 16.8473 14.9976 18.5027C14.9976 20.158 13.6556 21.5 12.0002 21.5C10.7374 21.5 9.65707 20.7191 9.21562 19.6139"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                      <span>{it.title}</span>
                    </button>
                  </li>
                ))}
                <li className="menu-item mb-2 justify-content-between withborder">
                  <Link
                    className="p-0 flex items-center w-full justify-start no-underline btn-leftnav"
                    to="#riwayatsuntingan"
                  >
                    <span className="mr-2">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14.9296 20.8748C14.3682 21.0595 13.781 21.1933 13.1727 21.2702C8.05307 21.9178 3.37784 18.2925 2.73027 13.1728C2.26877 9.52428 3.97741 6.10143 6.85048 4.20124"
                          stroke="currentColor"
                          strokeLinecap="round"
                        />
                        <path
                          d="M3.02832 3.96777L7.0283 3.98191L7.01416 7.98188"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9.08105 3.12402C13.9832 1.51199 19.264 4.17917 20.876 9.08134C22.2153 13.1541 20.6009 17.4881 17.2052 19.7626"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeDasharray="2 2"
                        />
                        <path
                          d="M7.61637 16.5177L11.4639 15.5844C11.6117 15.5485 11.7469 15.4729 11.8548 15.3657L17.0453 10.2078C17.5361 9.72009 17.5373 8.92648 17.0481 8.43724L15.7068 7.09596C15.2182 6.60737 14.4258 6.60788 13.9379 7.0971L8.76927 12.2789C8.66146 12.387 8.58541 12.5226 8.54942 12.671L7.61637 16.5177Z"
                          stroke="currentColor"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span>Riwayat Penyuntingan</span>
                  </Link>
                </li>
                <li className="menu-item mb-2 justify-content-between withborder">
                  <Link
                    className="p-0 flex items-center w-full justify-start no-underline btn-leftnav"
                    to="#tanggapan"
                  >
                    <span className="mr-2">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M21.0625 12C21.0625 17.0051 17.0051 21.0625 12 21.0625C10.218 21.0625 8.55605 20.5481 7.15463 19.6598L2.9375 21.0625L4.58125 17.2062C3.54555 15.7331 2.9375 13.9376 2.9375 12C2.9375 6.99492 6.99492 2.9375 12 2.9375C17.0051 2.9375 21.0625 6.99492 21.0625 12Z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="10.9287"
                          cy="12"
                          r="1.25"
                          fill="currentColor"
                        />
                        <circle
                          cx="16.0625"
                          cy="12"
                          r="1.25"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                    <span>Tanggapan</span>
                  </Link>
                </li>
              </ul>
            </nav>
            <hr />
          </>
        )}

        <nav>
          {isLoggedIn ? (
            <>
              <div
                className={`menu-title flex ${collapsed ? "justify-center" : "justify-between"} items-center ${!isAkunActive ? "text-gray-500" : ""}`}
                onClick={() => !collapsed && setAkunExpanded(!akunExpanded)}
                style={{
                  cursor: collapsed ? "default" : "pointer",
                  color: "inherit",
                }}
              >
                <span>
                  <span dangerouslySetInnerHTML={{ __html: ICONS.user }} />
                  {!collapsed && <> &nbsp; Akunku</>}
                </span>
                {!collapsed && <span>{akunExpanded ? "⌄" : "›"}</span>}
              </div>

              {akunExpanded && !collapsed && (
                <div className="menu-child">
                  <Link
                    to="/complete-profile"
                    className={`menu-item ${!isActive("/complete-profile") ? "text-gray-500" : ""}`}
                  >
                    <span dangerouslySetInnerHTML={{ __html: ICONS.user }} />
                    Biodata
                  </Link>

                  <Link
                    to="/settings"
                    className={`menu-item ${!isActive("/settings") ? "text-gray-500" : ""}`}
                  >
                    <span
                      dangerouslySetInnerHTML={{ __html: ICONS.settings }}
                    />
                    Pengaturan & Privasi
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div
              className={`menu-item mt-2 text-gray-500 navinactive ${collapsed ? "text-center" : ""}`}
            >
              <span dangerouslySetInnerHTML={{ __html: ICONS.user }} />
              {!collapsed && <> Akunku</>}
            </div>
          )}

          {isLoggedIn ? (
            <>
              <div
                className={`menu-title flex ${collapsed ? "justify-center" : "justify-between"} items-center ${!isSumbangsihActive ? "text-gray-500" : ""}`}
                onClick={() =>
                  !collapsed && setsumbangsihExpanded(!sumbangsihExpanded)
                }
                style={{
                  cursor: collapsed ? "default" : "pointer",
                  color: "inherit",
                }}
              >
                <span>
                  <span dangerouslySetInnerHTML={{ __html: ICONS.edit }} />
                  {!collapsed && <> &nbsp; Sumbangsih</>}
                </span>
                {!collapsed && <span>{sumbangsihExpanded ? "⌄" : "›"}</span>}
              </div>

              {sumbangsihExpanded && !collapsed && (
                <div className="menu-child">
                  <Link
                    to="/kronik"
                    className={`menu-item ${!isActive("/kronik") ? "text-gray-500" : ""}`}
                  >
                    <span dangerouslySetInnerHTML={{ __html: ICONS.kronik }} />
                    Kronik
                  </Link>
                  <Link
                    to="/tilik"
                    className={`menu-item ${!isActive("/tilik") ? "text-gray-500" : ""}`}
                  >
                    <span dangerouslySetInnerHTML={{ __html: ICONS.tilik }} />
                    Tilik
                  </Link>
                  <Link
                    to="/diskursus"
                    className={`menu-item ${!isActive("/diskursus") ? "text-gray-500" : ""}`}
                  >
                    <span
                      dangerouslySetInnerHTML={{ __html: ICONS.diskursus }}
                    />
                    Diskursus
                  </Link>
                  <Link
                    to="/tanggapan"
                    className={`menu-item ${!isActive("/tanggapan") ? "text-gray-500" : ""}`}
                  >
                    <span
                      dangerouslySetInnerHTML={{ __html: ICONS.tanggapan }}
                    />
                    Tanggapan
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div
              className={`menu-item navinactive text-gray-500 ${collapsed ? "text-center" : ""}`}
            >
              <span dangerouslySetInnerHTML={{ __html: ICONS.edit }} />
              {!collapsed && <> Sumbangsih</>}
            </div>
          )}
          <Link
            to="/tentang-telisik"
            className={`menu-item ${!isActive("/tentang-telisik") ? "text-gray-500" : ""} ${collapsed ? "text-center block" : ""}`}
          >
            <span dangerouslySetInnerHTML={{ __html: ICONS.info }} />
            {!collapsed && <> Tentang Telisik</>}
          </Link>

          <Link
            to="/bantuan"
            className={`menu-item ${!isActive("/bantuan") ? "text-gray-500" : ""} ${collapsed ? "text-center block" : ""}`}
          >
            <span dangerouslySetInnerHTML={{ __html: ICONS.help }} />
            {!collapsed && <> Bantuan & Dukungan</>}
          </Link>
        </nav>

        <hr className="mb-3" />

        {isLoggedIn ? (
          <Link
            to="#"
            className={`menu-item ${collapsed ? "text-center block" : ""}`}
            onClick={logout}
          >
            <span dangerouslySetInnerHTML={{ __html: ICONS.logout }} />
            {!collapsed && <> Keluar Log</>}
          </Link>
        ) : (
          <>
            <Link
              to="#"
              className={`menu-item navinactive text-gray-500 ${collapsed ? "block" : ""}`}
            >
              <span dangerouslySetInnerHTML={{ __html: ICONS.logout }} />
              {!collapsed && <> Keluar Log</>}
            </Link>
            <Link
              to="#"
              className={`menu-item navinactive text-gray-500 ${collapsed ? "text-center block" : ""}`}
              onClick={onToggle}
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: collapsed ? ICONS.bukamenu : ICONS.tutupmenu,
                }}
              />
              {!collapsed && <> Tutup Menu</>}
            </Link>
          </>
        )}

        {/* Left Banner */}
        {bannerLeft && (
          <div className="mb-3">
            <a href={bannerLeft.url} target="_blank" rel="noopener noreferrer">
              <img
                src={
                  bannerLeft.image.startsWith("/static/")
                    ? `${API_BASE}${bannerLeft.image}`
                    : bannerLeft.image
                }
                alt={bannerLeft.title}
                className="w-full rounded-none shadow-sm"
                style={{ aspectRatio: "2/1", objectFit: "cover" }}
              />
            </a>
          </div>
        )}
        {!collapsed && (
          <div className="feed-section mt-4">
            <h2
              className="font-semibold mb-3"
              style={{ fontSize: "1.3rem", color: "#FC6736" }}
            >
              Feed Tanggapan
            </h2>
            <hr className="my-2" />
            {loading ? (
              <div className="text-center py-4">
                <div
                  className="inline-block w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"
                  role="status"
                  aria-hidden="true"
                ></div>
                <span className="sr-only">Loading...</span>
              </div>
            ) : feedItems.length > 0 ? (
              <>
                {feedItems.map((item, index) => (
                  <div
                    key={`${item.article_id}-${item.paragraph_id}-${index}`}
                    className="mb-3 pb-3 border-bottom"
                  >
                    <div className="mb-2 ml-5">
                      <span style={{ fontSize: "0.8rem", color: "#878672" }}>
                        Merespons{" "}
                        <Link to={getArticleUrl(item)}>
                          {truncateText(item.paragraph_id, 10)}
                        </Link>
                      </span>
                    </div>

                    <div className="flex items-start mb-2">
                      <div
                        className="rounded-full mr-2"
                        style={{
                          width: "24px",
                          height: "24px",
                          minWidth: "24px",
                          backgroundColor: item.created_by.avatar
                            ? "transparent"
                            : "#f0ad4e",
                          backgroundImage: item.created_by.avatar
                            ? `url(${item.created_by.avatar.startsWith("/static/") ? `${API_BASE}${item.created_by.avatar}` : item.created_by.avatar})`
                            : "none",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span
                            className="font-semibold mr-2"
                            style={{ fontSize: "0.875rem" }}
                          >
                            {item.created_by.display_name || "Display Name"}
                          </span>
                          <span
                            className="text-gray-500"
                            style={{ fontSize: "0.75rem" }}
                          >
                            · {timeAgo(item.created_at) || "0m"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div>
                        <h6
                          className="mb-2 font-bold"
                          style={{ fontSize: "0.875rem", lineHeight: "1.3" }}
                        >
                          <Link
                            to={getArticleUrl(item)}
                            className="no-underline"
                          >
                            {truncateText(item.article_title, 60)}
                          </Link>
                        </h6>
                      </div>
                    </div>
                    <div>
                      <div>
                        <p
                          className="text-gray-500 mb-2"
                          style={{ fontSize: "0.8rem", lineHeight: "1.4" }}
                        >
                          {truncateText(item.comment, 150)}
                        </p>
                      </div>
                    </div>

                    {item.images && item.images.length > 0 && (
                      <div className="flex gap-2 mb-2 ml-5">
                        {item.images.map((thumb) => (
                          <div
                            key={thumb.id}
                            className="rounded-0"
                            style={{
                              width: "48px",
                              height: "48px",
                              backgroundImage: thumb
                                ? `url(${thumb.url.startsWith("/static/") ? `${API_BASE}${thumb.url}` : thumb.url})`
                                : "none",
                              backgroundColor: "#e9ecef",
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {item.image && (
                      <div className="mb-2 ml-5">
                        <img
                          src={item.image}
                          alt="preview"
                          className="w-full rounded-none"
                          style={{
                            maxHeight: "120px",
                            objectFit: "cover",
                            width: "100%",
                          }}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div
                        className="flex gap-3 text-gray-500"
                        style={{ fontSize: "0.8rem" }}
                      >
                        <span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            className="me-1"
                          >
                            <path
                              d="M14.3438 7.99988C14.3438 11.5034 11.5035 14.3436 7.99997 14.3436C6.75253 14.3436 5.58919 13.9836 4.6082 13.3617L1.65619 14.3436L2.80682 11.6442C2.08183 10.6131 1.65619 9.35618 1.65619 7.99988C1.65619 4.49632 4.4964 1.65613 7.99997 1.65613C11.5035 1.65613 14.3438 4.49632 14.3438 7.99988Z"
                              stroke="currentColor"
                              strokeLinejoin="round"
                            />
                            <ellipse
                              cx="7.25095"
                              cy="8"
                              rx="1"
                              ry="1"
                              fill="currentColor"
                            />
                            <ellipse
                              cx="10.8437"
                              cy="8"
                              rx="1"
                              ry="1"
                              fill="currentColor"
                            />
                          </svg>{" "}
                          {item.article_comments_count || 0}
                        </span>
                        <span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            className="me-1"
                          >
                            <path
                              d="M4.03769 5.87315L7.99993 1.91089M7.99993 1.91089L11.9622 5.87315M7.99993 1.91089V11.0702"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M1.87497 9.27661V12.3391C1.87497 13.3056 2.65847 14.0891 3.62497 14.0891H12.375C13.3415 14.0891 14.125 13.3056 14.125 12.3391V9.27661"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {item.article_share_count || 0}
                        </span>
                      </div>
                      <Link
                        to={getArticleUrl(item)}
                        className="inline-flex items-center px-3 py-1 text-sm border rounded-full border-gray-300"
                        style={{ fontSize: "0.8rem", borderRadius: "20px" }}
                      >
                        Tanggapi
                      </Link>
                    </div>
                  </div>
                ))}

                {hasMore && (
                  <div className="text-center mt-3 mb-3">
                    <button
                      className="px-3 py-1 text-sm border rounded border-gray-300"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      style={{ fontSize: "0.8rem" }}
                    >
                      {loadingMore ? (
                        <>
                          <span
                            className="inline-block w-3 h-3 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2"
                            aria-hidden="true"
                          ></span>
                          Memuat...
                        </>
                      ) : (
                        "Muat Lebih Banyak"
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 py-4">
                <p style={{ fontSize: "0.85rem" }}>Belum ada tanggapan.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showPhotoModal && (
        <ProfilePhotoModal onClose={() => setShowPhotoModal(false)} />
      )}
    </>
  );
}
