import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import SectionDisplay from "../components/SectionDisplay";
import DiskursusContent from "../components/DiskursusContent";
import SidebarNav from "../components/SidebarNav";
import ActorPowerInterestChart from "../components/ActorPowerInterestChart";
import ArticleLocationMap from "../components/ArticleLocationMap";
import ArticleHeader from "../components/ArticleHeader";
import ArticleEditModeModal from "../components/ArticleEditModeModal";
import { API_BASE, WS_BASE } from "../config";
import { useAuth } from "../AuthContext";
import CommentsSection from "../components/CommentsSection";
import { Alert, Button, Skeleton } from "../components/ui";

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
  );
}

export default function ArticlePage() {
  const { slug, tipe } = useParams();
  const [article, setArticle] = useState(null);
  const [contributor, setContributor] = useState(null);
  const [sections, setSections] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const wsRef = useRef(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState({
    lokasi: false,
    jenisKonflik: false,
    kronik: true,
    tilik: true,
    diskursus: true,
    tanggapan: true,
  });

  const isDiskursus = tipe === "diskursus";
  const searchAreaOptions = [
    { key: "kronik", label: "Kronik" },
    { key: "tilik", label: "Tilik" },
    { key: "diskursus", label: "Diskursus" },
    { key: "tanggapan", label: "Tanggapan" },
  ];

  async function fetchArticle() {
    try {
      const resp = await fetch(`${API_BASE}/api/articles/${tipe}/${slug}/`);
      if (!resp.ok) throw new Error("Failed to load article");
      const data = await resp.json();
      setArticle(data.article ?? data);
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: "Failed to load article." });
    }
  }

  async function fetchSections() {
    if (isDiskursus) {
      setSections([]);
      return;
    }

    try {
      const resp = await fetch(
        `${API_BASE}/api/articles/${tipe}/${slug}/sections/`,
      );
      if (!resp.ok) {
        if (resp.status === 400) {
          setSections([]);
          return;
        }
        throw new Error("Failed to load sections");
      }
      const data = await resp.json();
      setSections(data);
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: "Failed to load sections." });
    }
  }

  async function fetchContributors() {
    try {
      const resp = await fetch(
        `${API_BASE}/api/articles/${tipe}/${slug}/contributors/`,
      );
      if (!resp.ok) throw new Error("Failed to load contributors");
      const data = await resp.json();
      setContributor(data.contributors ?? data);
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: "Failed to load contributors." });
    }
  }

  const handleEditModeToggle = (e) => {
    const checked = e.target.checked;
    if (checked) {
      setShowModal(true);
    } else {
      setIsEditMode(false);
    }
  };

  const handleConfirmEditMode = () => {
    setIsEditMode(true);
    setShowModal(false);
  };

  const handleCancelEditMode = () => {
    setIsEditMode(false);
    setShowModal(false);
  };

  function buildGlobalFootnoteMap(sections) {
    let counter = 0;
    const map = {};
    if (!sections) {
      return {};
    }
    sections.forEach((section) => {
      (section.paragraphs || [])
        .filter((p) => !p.is_deleted)
        .sort((a, b) => a.order - b.order)
        .forEach((paragraph) => {
          (paragraph.footnotes || []).forEach((fn) => {
            if (!map[fn.id]) {
              counter += 1;
              map[fn.id] = counter;
            }
          });
        });
    });

    return map;
  }

  useEffect(() => {
    fetchArticle();
    fetchSections();
    fetchContributors();

    if (!isDiskursus) {
      const ws = new WebSocket(`${WS_BASE}/ws/article/${tipe}/${slug}/`);
      ws.onopen = () => {};
      ws.onerror = (err) => {
        console.error("WS error for article", slug, err);
        setAlert({
          type: "danger",
          message: "Realtime connection failed (live updates unavailable).",
        });
      };
      ws.onmessage = (ev) => {
        try {
          const wrapper = JSON.parse(ev.data);
          const msg = wrapper.event ?? wrapper;
          if (!msg || !msg.type) return;

          if (["section_updated", "paragraph_updated"].includes(msg.type)) {
            fetchSections();
          }
        } catch (e) {
          console.error("WS parse", e);
        }
      };
      ws.onclose = () => {};
      wsRef.current = ws;

      return () => {
        wsRef.current?.close();
      };
    }
  }, [slug, tipe, isDiskursus]);

  if (!article) return <div>Loading…</div>;
  if (!isDiskursus && !sections) return <div>Loading…</div>;

  const navItems = isDiskursus
    ? []
    : sections.map((s) => ({
        id: s.id,
        key: s.section_type.key,
        title: s.section_type?.label || s.section_type?.key,
      }));

  const canEdit =
    user && ["admin", "editor", "contributor"].includes(user.role);

  const articleType = isDiskursus
    ? "Diskursus"
    : toTitleCase(article.article_type || tipe);

  const footnoteNumberMap = buildGlobalFootnoteMap(sections);

  const handleParagraphUpdate = (updatedParagraph) => {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        paragraphs: (section.paragraphs || []).map((p) =>
          p.id === updatedParagraph.id ? updatedParagraph : p,
        ),
      })),
    );
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("q", searchQuery);
    if (searchFilters.lokasi) params.append("lokasi", "1");
    if (searchFilters.jenisKonflik) params.append("jenis_konflik", "1");

    const types = [];
    if (searchFilters.kronik) types.push("kronik");
    if (searchFilters.tilik) types.push("tilik");
    if (searchFilters.diskursus) types.push("diskursus");
    if (searchFilters.tanggapan) types.push("tanggapan");
    if (types.length > 0) params.append("types", types.join(","));

    window.location.href = `/search?${params.toString()}`;
  };

  const handleSearchFilterChange = (key) => (e) => {
    setSearchFilters((prev) => ({
      ...prev,
      [key]: e.target.checked,
    }));
  };

  const retryLoadArticle = () => {
    fetchArticle();
    fetchSections();
    fetchContributors();
  };

  if (!article || (!isDiskursus && !sections)) {
    return (
      <div className="min-h-screen bg-[#f7f5ef]">
        <div className="mx-auto tw-grid w-[98%] grid-cols-1 gap-4 py-4 lg:grid-cols-12">
          <div className="hidden lg:col-span-2 lg:block">
            <Skeleton height="h-[80vh]" />
          </div>
          <div className="space-y-4 lg:col-span-7">
            <Skeleton height="h-6" />
            <Skeleton height="h-10" />
            <Skeleton height="h-64" />
            <Skeleton count={5} />
          </div>
          <div className="hidden lg:col-span-3 lg:block">
            <Skeleton height="h-[60vh]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="article-page-shell dashboard-article-shell flex min-h-screen flex-col bg-[#F9F6EF] xl:h-[calc(100vh-60px)] xl:min-h-0 xl:overflow-hidden">
      <ArticleEditModeModal
        show={showModal}
        onConfirm={handleConfirmEditMode}
        onCancel={handleCancelEditMode}
      />

      <div className="w-[96%] mx-auto mt-2">
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: "", message: "" })}
          onRetry={retryLoadArticle}
        />
      </div>

      <div className="flex-1 min-h-0">
        <div className="h-full min-h-0">
          <div className="tw-grid h-full min-h-0 grid-cols-1 lg:grid-cols-12">
            <div
              className={
                collapsed
                  ? "article-left-rail dashboard-article-left hidden h-full overflow-y-scroll overflow-x-hidden border-r border-[#dfddd4] bg-[#F9F6EF] transition-[width] duration-200 lg:col-span-1 lg:block lg:w-[56px]"
                  : "article-left-rail dashboard-article-left hidden h-full overflow-y-scroll overflow-x-hidden border-r border-[#dfddd4] bg-[#F9F6EF] pb-5 transition-[width] duration-200 lg:col-span-2 lg:block"
              }
            >
              <SidebarNav
                articleTOC={navItems}
                collapsed={collapsed}
                mode="article"
                onToggle={() => setCollapsed(!collapsed)}
              />
            </div>

            <div
              id="middle-col-scroll"
              className={`article-main-panel dashboard-article-main h-full min-h-0 min-w-0 overflow-x-hidden overflow-y-auto border-x border-[#e2e0d8] bg-[#F9F6EF] pb-5 transition-[width] duration-200 lg:overflow-y-scroll lg:max-h-none ${
                collapsed ? "lg:col-span-8" : "lg:col-span-7"
              }`}
            >
              <div className="p-3">
                <nav
                  className="mb-2 text-sm text-neutral-600"
                  aria-label="breadcrumbs"
                >
                  <ol className="flex items-center gap-2">
                    <li>
                      <a
                        href="/"
                        className="text-telisik hover:text-telisik-dark"
                      >
                        Beranda
                      </a>
                    </li>
                    <li className="text-neutral-400">/</li>
                    <li>
                      <Link
                        className="text-telisik hover:text-telisik-dark"
                        to={`/${tipe}`}
                      >
                        {articleType}
                      </Link>
                    </li>
                    <li className="text-neutral-400">/</li>
                    <li className="line-clamp-1 text-neutral-700">
                      {article.title}
                    </li>
                  </ol>
                </nav>
              </div>

              <ArticleHeader
                article={article}
                contributor={contributor}
                isDiskursus={isDiskursus}
                slug={slug}
                tipe={tipe}
                canEdit={canEdit}
              />

              {isDiskursus ? (
                <div className="px-3 pb-3">
                  <DiskursusContent
                    content={article.content}
                    canEdit={canEdit}
                    isEditMode={isEditMode}
                    articleSlug={slug}
                    tipe={tipe}
                  />
                </div>
              ) : (
                sections.map((s) => (
                  <div key={s.id} className="px-3 pb-3">
                    <SectionDisplay
                      section={s}
                      articleSlug={slug}
                      tipe={tipe}
                      canEdit={canEdit}
                      isEditMode={isEditMode}
                      footnoteNumberMap={footnoteNumberMap}
                      onParagraphUpdate={handleParagraphUpdate}
                    />
                  </div>
                ))
              )}
              <div className="px-3 pb-3">
                <div className="dashboard-revision-wrap mb-5">
                  <h2 className="dashboard-revision-title">
                    Riwayat Penyuntingan & Kontributor
                  </h2>
                  <p className="dashboard-revision-copy">
                    Pantau jejak perubahan naskah dari waktu ke waktu untuk
                    menjaga akurasi serta transparansi kontribusi.
                  </p>
                  <div className="dashboard-callout-cta">
                    Seruan/ajakan/lainnya
                  </div>
                </div>
                <CommentsSection articleSlug={slug} tipe={tipe} />
              </div>
            </div>

            <div className="article-right-rail dashboard-article-right h-full min-h-0 min-w-0 overflow-x-hidden overflow-y-auto border-l border-[#dfddd4] bg-[#F9F6EF] px-3 pb-5 lg:col-span-3 lg:overflow-y-scroll lg:max-h-none">
              <div className="right-sidebar-shell dashboard-right-sidebar px-1 py-1">
                <div className="right-find-shell dashboard-find-shell mb-4">
                  <div className="mb-3">
                    <h3
                      className="right-find-title mb-0 text-[2rem] font-bold text-[#FC6736]"
                      style={{ color: "#FC6736" }}
                    >
                      Temukan
                    </h3>
                  </div>

                  <div className="right-find-input-row mb-3 flex items-center">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        className="right-find-input w-full rounded-full border border-[#ddd9ce] bg-[#F9F6EF] px-4 py-2 pr-12 text-[0.95rem] text-[#555333] focus:outline-none focus:ring-2 focus:ring-[#9ab1d3]"
                        placeholder="Temukan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      />

                      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center space-x-2">
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            aria-label="Clear search"
                            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 6l-12 12"></path>
                              <path d="M6 6l12 12"></path>
                            </svg>
                          </button>
                        )}

                        <button
                          onClick={handleSearch}
                          className="rounded-full p-1 text-gray-600 hover:bg-gray-100"
                          aria-label="Search"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              cx="7.5"
                              cy="7.5"
                              r="5.9"
                              stroke="#878672"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                            />
                            <path
                              d="M12 12L14.3827 14.3827"
                              stroke="#878672"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`right-find-advanced ${showAdvancedSearch ? "right-find-advanced-panel" : ""}`}
                  >
                    <label className="right-find-toggle-label flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="right-find-master-toggle"
                        checked={showAdvancedSearch}
                        onChange={(e) =>
                          setShowAdvancedSearch(e.target.checked)
                        }
                      />
                      <span className="right-find-label-text italic">
                        Perinci pencarian
                      </span>
                    </label>

                    {showAdvancedSearch && (
                      <div className="mt-3">
                        <div className="mb-3 space-y-3 pl-4">
                          <label className="right-find-option flex items-center space-x-2">
                            <input
                              type="checkbox"
                              className="right-find-switch"
                              checked={searchFilters.lokasi}
                              onChange={handleSearchFilterChange("lokasi")}
                            />
                            <span className="right-find-label-text">
                              Lokasi
                            </span>
                          </label>

                          <label className="right-find-option flex items-center space-x-2">
                            <input
                              type="checkbox"
                              className="right-find-switch"
                              checked={searchFilters.jenisKonflik}
                              onChange={handleSearchFilterChange(
                                "jenisKonflik",
                              )}
                            />
                            <span className="right-find-label-text">
                              Jenis Konflik
                            </span>
                          </label>
                        </div>

                        <hr className="mb-3" />

                        <div className="mt-0">
                          <div className="right-find-area-title mb-2 italic">
                            Area pencarian:
                          </div>
                          <div className="right-find-area-grid right-find-area-grid--home">
                            {searchAreaOptions.map((option) => (
                              <label
                                key={option.key}
                                className="right-find-option right-find-area-option"
                              >
                                <input
                                  type="checkbox"
                                  className="right-find-checkbox"
                                  checked={searchFilters[option.key]}
                                  onChange={handleSearchFilterChange(
                                    option.key,
                                  )}
                                />
                                <span className="right-find-area-text">
                                  {option.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="right-find-submit-row mt-3 flex justify-end">
                          <button
                            onClick={handleSearch}
                            className="right-find-submit font-medium text-sm transition"
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
                              className="mr-2 inline-block"
                            >
                              <circle cx="11" cy="11" r="8" />
                              <path d="m21 21-4.35-4.35" />
                            </svg>
                            Temukan
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Panel Tanggapi/Sunting — tampil untuk semua user yang login */}
              {user && (
                <div
                  id="edit-mode-panel"
                  className={`edit-mode-panel mb-4 overflow-hidden rounded-lg border transition-all duration-200 ${
                    isEditMode
                      ? "border-[#b8d4a8] bg-[#f3f8ef]"
                      : "border-[#d4c9b0] bg-[#f5f1e8]"
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (!isEditMode) {
                      setShowModal(true);
                    } else {
                      setIsEditMode(false);
                    }
                  }}
                >
                  {/* Hidden checkbox untuk accessibility / backward compat */}
                  <input
                    type="checkbox"
                    id="editModeToggle"
                    className="sr-only"
                    checked={isEditMode}
                    onChange={handleEditModeToggle}
                    tabIndex={-1}
                    onClick={(e) => e.stopPropagation()}
                  />

                  {/* ── Header row ─────────────────────────── */}
                  <div className="flex items-center gap-2.5 px-3 py-2.5">
                    {/* iOS-style toggle switch */}
                    <span
                      className="relative inline-flex flex-shrink-0 items-center rounded-full transition-colors duration-200"
                      style={{
                        width: "34px",
                        height: "20px",
                        background: isEditMode ? "#4a9a2e" : "#c8c4b4",
                      }}
                    >
                      <span
                        className="absolute rounded-full bg-white shadow transition-transform duration-200"
                        style={{
                          width: "14px",
                          height: "14px",
                          left: "3px",
                          transform: isEditMode ? "translateX(14px)" : "translateX(0)",
                        }}
                      />
                    </span>
                    <h3
                      className="m-0 flex-1 text-[0.88rem] font-bold leading-tight"
                      style={{ color: isEditMode ? "#4a7a2e" : "#ef5f2f" }}
                    >
                      Tanggapi/Sunting Sekarang
                    </h3>
                    {isEditMode && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[0.7rem] font-semibold"
                        style={{
                          background: "rgba(90,138,58,0.12)",
                          color: "#4a7a2e",
                        }}
                      >
                        Aktif
                      </span>
                    )}
                  </div>

                  {/* ── Tab icons row ───────────────────────── */}
                  <div
                    className="flex items-center gap-4 border-t px-3 py-2"
                    style={{ borderTopColor: isEditMode ? "#c8dfc0" : "#e0d7c4" }}
                  >
                    <span
                      className="flex items-center gap-1.5 text-[0.8rem]"
                      style={{ color: "#6b7260" }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span className="italic">Tanggapi</span>
                    </span>
                    <span
                      className="flex items-center gap-1.5 text-[0.8rem]"
                      style={{ color: "#6b7260" }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <span className="italic">Sunting</span>
                    </span>
                  </div>

                  {/* ── Deskripsi ───────────────────────────── */}
                  <p
                    className="px-3 pb-3 pt-1 text-[0.8rem] leading-[1.55]"
                    style={{ color: isEditMode ? "#4a7a2e" : "#ef5f2f" }}
                  >
                    <span className="font-medium">
                      {isDiskursus
                        ? 'Klik "Tanggapi" atau "Sunting" di bawah konten.'
                        : "Aktifkan mode sunting & komentar per bagian."}
                    </span>{" "}
                    <span className="italic" style={{ color: "#9a7040" }}>
                      {isDiskursus
                        ? "Jadikan Diskursus ini makin bermutu."
                        : `Tanggapi atau sunting agar ${
                            tipe === "tilik" ? "Tilik" : "Kronik"
                          } ini makin perinci terdokumentasi.`}
                    </span>
                  </p>
                </div>
              )}

              <div className="p-2">
                {!isDiskursus && (
                  <ArticleLocationMap location={article.location_geojson} />
                )}
                {!isDiskursus && (
                  <ActorPowerInterestChart slug={slug} tipe={tipe} />
                )}
                {article.summary && (
                  <div className="mt-3">
                    <h5 className="font-semibold text-lg">RANGKUMAN</h5>
                    <p>{article.summary}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
