import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ICONS, API_BASE } from "../config";
import { useAuth } from "../AuthContext";
import ProfilePhotoModal from "./ProfilePhotoModal";
import UserBadge from "./UserBadge";

const menuItemBase =
  "flex items-center gap-2.5 py-1.5 text-[15px] no-underline transition-all duration-300";
const menuTitleBase =
  "mb-1.5 flex items-center text-sm font-semibold text-[#6b6b6b] transition-all duration-300";

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
  mode = "default",
}) {
  const mediaBase = API_BASE || "https://api.telisik.org";
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
  const focusArticleSubnav = mode === "article" && showTOC && !collapsed;

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
      const bannersRes = await fetch(`${API_BASE}/api/banners/`);

      if (!bannersRes.ok) {
        throw new Error("Failed to fetch sidebar data");
      }

      const bannersData = await bannersRes.json();
      setBanners(bannersData.banners || []);
    } catch (error) {
      console.error("Error fetching sidebar data:", error);
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

  const resolveBannerImage = (banner) => {
    if (!banner) return "";

    const rawImage =
      typeof banner.image === "string" ? banner.image.trim() : "";
    const rawUrl = typeof banner.url === "string" ? banner.url.trim() : "";

    // Some payloads send static image path in `url` while `image` is empty.
    const imagePath =
      rawImage ||
      (rawUrl.startsWith("/static/") || rawUrl.startsWith("static/")
        ? rawUrl
        : "");

    if (!imagePath) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    return imagePath.startsWith("/")
      ? `${mediaBase}${imagePath}`
      : `${mediaBase}/${imagePath}`;
  };

  const getBannerHref = (banner) => {
    if (!banner || typeof banner.url !== "string") return "";

    const rawUrl = banner.url.trim();
    if (!rawUrl) return "";

    // Static asset path is an image source, not a click destination.
    if (rawUrl.startsWith("/static/") || rawUrl.startsWith("static/")) {
      return "";
    }

    return rawUrl;
  };

  const bannerLeftImage = resolveBannerImage(bannerLeft);
  const bannerLeftHref = getBannerHref(bannerLeft);

  const hideBrokenImage = (event) => {
    event.currentTarget.style.display = "none";
  };

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
      <div
        className={`sidebar-nav-shell hidden h-full bg-transparent pb-4 pt-4 md:block w-full px-0`}
      >
        {isLoggedIn ? (
          <div className="text-left mb-4">
            <div
              className={`mb-2 flex cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#eef6c9] transition-all duration-300 ${
                focusArticleSubnav ? "w-full max-w-none" : "max-w-[112px]"
              }`}
              onClick={() => setShowPhotoModal(true)}
              style={{ cursor: "pointer" }}
            >
              {/* {user.avatar ? (
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
              )} */}
            </div>
            {!collapsed && (
              <>
                <UserBadge
                  layout="stack"
                  name={user.display_name || "Display Name"}
                  avatar={user.avatar || ""}
                  size={40}
                  nameSize="0.95rem"
                  subtitle={`@${user.username || "username"}`}
                  subtitleSize="0.8rem"
                />
              </>
            )}
          </div>
        ) : (
          <div
            className="mb-4 cursor-pointer text-left"
            onClick={() => navigate("/login")}
          >
            <img
              src="/login.svg"
              alt="Login"
              className={collapsed ? "w-10 h-10" : "w-12 h-12 mb-2"}
              style={{ transition: "all 0.3s ease" }}
            />
            {!collapsed && (
              <>
                <div className="fw-semibold">Sila Masuk/Mendaftar</div>
                <div className="text-muted small">Sumbangsihmu ditunggu</div>
              </>
            )}
          </div>
        )}

        <hr className="mb-4 h-px border-3 bg-[#d9d6c7]" />

        {showTOC && !collapsed && (
          <>
            <nav>
              <ul className="list-none pl-0 text-left">
                {articleTOC.map((it) => (
                  <li key={it.id} className="border-b border-[#CDCB9C] py-2">
                    <button
                      type="button"
                      className="flex w-full items-center justify-start gap-2 p-0 text-left text-[#3f3e26] no-underline hover:text-[#1f1e12]"
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
                      <span className="shrink-0">
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
                <li className="border-b border-[#CDCB9C] py-2 text-[15px] text-[#4a4a4a]">
                  <Link
                    className="flex w-full items-center justify-start gap-2 p-0 text-left text-[#3f3e26] no-underline hover:text-[#1f1e12]"
                    to="#riwayatsuntingan"
                  >
                    <span className="shrink-0">
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
                <li className="border-b border-[#CDCB9C] py-2 text-[15px] text-[#4a4a4a]">
                  <Link
                    className="flex w-full items-center justify-start gap-2 p-0 text-left text-[#3f3e26] no-underline hover:text-[#1f1e12]"
                    to="#tanggapan"
                  >
                    <span className="shrink-0">
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
            <hr className="my-2 h-px border-3 bg-[#CDCB9C]" />
          </>
        )}

        {focusArticleSubnav && <div className="pb-2" />}

        {!focusArticleSubnav && (
          <nav>
            {isLoggedIn ? (
              <>
                <div
                  className={`${menuTitleBase} ${collapsed ? "justify-center" : "justify-between"} ${!isAkunActive ? "text-gray-500" : ""}`}
                  onClick={() => !collapsed && setAkunExpanded(!akunExpanded)}
                  style={{
                    cursor: collapsed ? "default" : "pointer",
                    color: "inherit",
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-flex shrink-0"
                      dangerouslySetInnerHTML={{ __html: ICONS.user }}
                    />
                    {!collapsed && <span className="leading-none">Akunku</span>}
                  </span>
                  {!collapsed && <span>{akunExpanded ? "⌄" : "›"}</span>}
                </div>

                {akunExpanded && !collapsed && (
                  <div className="pl-6">
                    <Link
                      to="/complete-profile"
                      className={`${menuItemBase} ${!isActive("/complete-profile") ? "text-gray-500" : "text-[#4a4a4a]"}`}
                    >
                      <span dangerouslySetInnerHTML={{ __html: ICONS.user }} />
                      Biodata
                    </Link>

                    <Link
                      to="/settings"
                      className={`${menuItemBase} ${!isActive("/settings") ? "text-gray-500" : "text-[#4a4a4a]"}`}
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
                className={`${menuItemBase} mt-2 text-[#D1CFC3] ${collapsed ? "justify-center text-center" : ""}`}
              >
                <span dangerouslySetInnerHTML={{ __html: ICONS.user }} />
                {!collapsed && <> Akunku</>}
              </div>
            )}

            {isLoggedIn ? (
              <>
                <div
                  className={`${menuTitleBase} ${collapsed ? "justify-center" : "justify-between"} ${!isSumbangsihActive ? "text-gray-500" : ""}`}
                  onClick={() =>
                    !collapsed && setsumbangsihExpanded(!sumbangsihExpanded)
                  }
                  style={{
                    cursor: collapsed ? "default" : "pointer",
                    color: "inherit",
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-flex shrink-0"
                      dangerouslySetInnerHTML={{ __html: ICONS.edit }}
                    />
                    {!collapsed && (
                      <span className="leading-none">Sumbangsih</span>
                    )}
                  </span>
                  {!collapsed && <span>{sumbangsihExpanded ? "⌄" : "›"}</span>}
                </div>

                {sumbangsihExpanded && !collapsed && (
                  <div className="pl-6">
                    <Link
                      to="/kronik"
                      className={`${menuItemBase} ${!isActive("/kronik") ? "text-gray-500" : "text-[#4a4a4a]"}`}
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: ICONS.kronik }}
                      />
                      Kronik
                    </Link>
                    <Link
                      to="/tilik"
                      className={`${menuItemBase} ${!isActive("/tilik") ? "text-gray-500" : "text-[#4a4a4a]"}`}
                    >
                      <span dangerouslySetInnerHTML={{ __html: ICONS.tilik }} />
                      Tilik
                    </Link>
                    <Link
                      to="/diskursus"
                      className={`${menuItemBase} ${!isActive("/diskursus") ? "text-gray-500" : "text-[#4a4a4a]"}`}
                    >
                      <span
                        dangerouslySetInnerHTML={{ __html: ICONS.diskursus }}
                      />
                      Diskursus
                    </Link>
                    <Link
                      to="/tanggapan"
                      className={`${menuItemBase} ${!isActive("/tanggapan") ? "text-gray-500" : "text-[#4a4a4a]"}`}
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
                className={`${menuItemBase} text-[#D1CFC3] ${collapsed ? "justify-center text-center" : ""}`}
              >
                <span dangerouslySetInnerHTML={{ __html: ICONS.edit }} />
                {!collapsed && <> Sumbangsih</>}
              </div>
            )}
            <Link
              to="/tentang-telisik"
              className={`${menuItemBase} ${!isActive("/tentang-telisik") ? "text-gray-500" : "text-[#4a4a4a]"} ${collapsed ? "block justify-center text-center" : ""}`}
            >
              <span dangerouslySetInnerHTML={{ __html: ICONS.info }} />
              {!collapsed && <> Tentang Telisik</>}
            </Link>

            <Link
              to="/bantuan"
              className={`${menuItemBase} ${!isActive("/bantuan") ? "text-gray-500" : "text-[#4a4a4a]"} ${collapsed ? "block justify-center text-center" : ""}`}
            >
              <span dangerouslySetInnerHTML={{ __html: ICONS.help }} />
              {!collapsed && <> Bantuan & Dukungan</>}
            </Link>
          </nav>
        )}

        {!focusArticleSubnav && (
          <hr className="mb-3 h-px border-3 bg-[#d9d6c7]" />
        )}

        {!focusArticleSubnav &&
          (isLoggedIn ? (
            <Link
              to="#"
              className={`${menuItemBase} text-[#4a4a4a] ${collapsed ? "block justify-center text-center" : ""}`}
              onClick={logout}
            >
              <span dangerouslySetInnerHTML={{ __html: ICONS.logout }} />
              {!collapsed && <> Keluar Log</>}
            </Link>
          ) : (
            <>
              <Link
                to="#"
                className={`${menuItemBase} text-[#D1CFC3] ${collapsed ? "block" : ""}`}
              >
                <span dangerouslySetInnerHTML={{ __html: ICONS.logout }} />
                {!collapsed && <> Keluar Log</>}
              </Link>
              <Link
                to="#"
                className={`${menuItemBase} text-[#D1CFC3] ${collapsed ? "block justify-center text-center" : ""}`}
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
          ))}

        {!focusArticleSubnav && !collapsed && (
          <hr className="my-2 h-px border-3 bg-[#d9d6c7]" />
        )}

        {/* Left Banner - make square and full-width */}
        {!focusArticleSubnav && bannerLeft && bannerLeftImage && (
          <div className="mb-3 w-full">
            {bannerLeftHref ? (
              <a
                href={bannerLeftHref}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <div className="relative w-full" style={{ paddingTop: "100%" }}>
                  <img
                    src={bannerLeftImage}
                    alt={bannerLeft.title}
                    className="absolute inset-0 w-full h-full rounded-sm border border-[#dedacb] shadow-sm object-cover"
                    onError={hideBrokenImage}
                  />
                </div>
              </a>
            ) : (
              <div className="relative w-full" style={{ paddingTop: "100%" }}>
                <img
                  src={bannerLeftImage}
                  alt={bannerLeft.title}
                  className="absolute inset-0 w-full h-full rounded-sm border border-[#dedacb] shadow-sm object-cover"
                  onError={hideBrokenImage}
                />
              </div>
            )}
          </div>
        )}
        {!focusArticleSubnav && !collapsed && (
          <div
            className="feed-section mt-4 w-full text-left"
            style={{ paddingLeft: 0, paddingRight: 0 }}
          >
            <hr className="mb-4 h-px border-3 bg-[#d9d6c7]" />
            <h2
              className="font-semibold mb-2"
              style={{
                fontSize: "1.15rem",
                color: "#f97316",
                textAlign: "left",
              }}
            >
              (Feed Tanggapan)
            </h2>
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
                    className="mb-2 border-b border-gray-200 pb-2"
                  >
                    <div
                      className="mb-2"
                      style={{ fontSize: "0.78rem", color: "#9ca3af" }}
                    >
                      Merespons{" "}
                      <Link
                        to={getArticleUrl(item)}
                        className="no-underline text-[#0088FF]"
                        style={{ color: "#0088FF" }}
                      >
                        {truncateText(item.paragraph_id, 40)}
                      </Link>
                    </div>

                    <UserBadge
                      name={item.created_by.display_name || "Display Name"}
                      avatar={
                        item.created_by.avatar
                          ? item.created_by.avatar.startsWith("/static/")
                            ? `${mediaBase}${item.created_by.avatar}`
                            : item.created_by.avatar
                          : ""
                      }
                      time={timeAgo(item.created_at) || "0m"}
                      size={22}
                      nameSize="0.78rem"
                      timeSize="0.65rem"
                      nameColor="#1f2937"
                    />
                    <div>
                      <div>
                        <h6
                          className="mb-2 font-bold"
                          style={{
                            fontSize: "0.9rem",
                            lineHeight: "1.2",
                          }}
                        >
                          <Link
                            to={getArticleUrl(item)}
                            className="no-underline"
                            style={{ color: "#f97316" }}
                          >
                            {truncateText(item.article_title, 60)}
                          </Link>
                        </h6>
                      </div>
                    </div>
                    <div>
                      <div>
                        <p
                          className="mb-1"
                          style={{
                            fontSize: "0.78rem",
                            lineHeight: "1.4",
                            color: "#6b6b6b",
                          }}
                        >
                          {truncateText(item.comment, 150)}
                        </p>
                      </div>
                    </div>

                    {item.images && item.images.length > 0 && (
                      <div className="flex gap-2 mb-2">
                        {item.images.map((thumb) => (
                          <div
                            key={thumb.id}
                            className="rounded-none overflow-hidden"
                            style={{
                              width: "48px",
                              height: "48px",
                              backgroundImage:
                                thumb && thumb.url
                                  ? `url(${thumb.url.startsWith("/static/") ? `${mediaBase}${thumb.url}` : thumb.url})`
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
                      <div className="mb-2">
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
                        className="flex gap-3"
                        style={{ fontSize: "0.78rem", color: "#9ca3af" }}
                      >
                        <span style={{ display: "flex" }}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            fill="none"
                            className="mr-1"
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
                        <span style={{ display: "flex" }}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            fill="none"
                            className="mr-1"
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
