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
        <div className="mx-auto grid w-[98%] grid-cols-1 gap-4 py-4 md:grid-cols-12">
          <div className="hidden md:col-span-2 md:block">
            <Skeleton height="h-[80vh]" />
          </div>
          <div className="space-y-4 md:col-span-7">
            <Skeleton height="h-6" />
            <Skeleton height="h-10" />
            <Skeleton height="h-64" />
            <Skeleton count={5} />
          </div>
          <div className="hidden md:col-span-3 md:block">
            <Skeleton height="h-[60vh]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="article-page-shell flex min-h-screen flex-col bg-[#f7f5ef] xl:h-[calc(100vh-60px)] xl:min-h-0 xl:overflow-hidden">
      <ArticleEditModeModal
        show={showModal}
        onConfirm={handleConfirmEditMode}
        onCancel={handleCancelEditMode}
      />

      <div className="w-[98%] mx-auto mt-2">
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: "", message: "" })}
          onRetry={retryLoadArticle}
        />
      </div>

      <div className="flex-1 min-h-0">
        <div className="h-full min-h-0">
          <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-12">
            <div
              className={
                collapsed
                  ? "article-left-rail hidden h-full overflow-y-scroll overflow-x-hidden border-r border-[#dfddd4] bg-[#f7f5ef] transition-[width] duration-200 md:col-auto md:block md:w-[52px]"
                  : "article-left-rail hidden h-full overflow-y-scroll overflow-x-hidden border-r border-[#dfddd4] bg-[#f7f5ef] pb-5 transition-[width] duration-200 md:col-span-2 md:block"
              }
            >
              <SidebarNav
                articleTOC={navItems}
                collapsed={collapsed}
                onToggle={() => setCollapsed(!collapsed)}
              />
            </div>

            <div
              id="middle-col-scroll"
              className="article-main-panel h-full min-h-0 overflow-y-auto border-x border-[#e2e0d8] bg-[#faf8f1] pb-5 transition-[width] duration-200 md:col-span-7 md:overflow-y-scroll md:max-h-none"
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
                <CommentsSection articleSlug={slug} tipe={tipe} />
              </div>
            </div>

            <div className="article-right-rail h-full min-h-0 overflow-y-auto border-l border-[#dfddd4] bg-[#f7f5ef] px-3 pb-5 md:col-span-3 md:overflow-y-scroll md:max-h-none">
              <div className="article-search-shell mb-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="mb-3">
                  <h3 className="mb-0 text-2xl font-semibold text-telisik">
                    Temukan
                  </h3>
                </div>
                <div className="article-search-input-shell mb-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-2">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      className="article-search-input w-full rounded-full border border-neutral-300 bg-white px-3 py-2 pr-20 text-sm text-neutral-800 outline-none transition-colors focus:border-telisik"
                      placeholder="Lorem ipsum search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute right-2 flex items-center space-x-2">
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="article-search-icon-btn text-neutral-500 hover:text-neutral-700"
                          aria-label="Clear search"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="icon icon-1"
                          >
                            <path d="M18 6l-12 12"></path>
                            <path d="M6 6l12 12"></path>
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={handleSearch}
                        className="article-search-icon-btn ml-2 text-neutral-500 hover:text-neutral-700"
                        aria-label="Cari"
                      >
                        <svg
                          width="16"
                          height="16"
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

                <div className="article-advanced-shell rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                  <div>
                    <label className="article-advanced-toggle-label flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="article-advanced-toggle h-4 w-4 rounded border-neutral-300 text-telisik focus:ring-telisik"
                        checked={showAdvancedSearch}
                        onChange={(e) =>
                          setShowAdvancedSearch(e.target.checked)
                        }
                      />
                      <span className="text-sm italic text-neutral-500">
                        Perinci pencarian
                      </span>
                    </label>
                  </div>

                  {showAdvancedSearch && (
                    <div className="advanced-search-panel mt-3 space-y-4">
                      <div className="space-y-2 pl-5">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2 h-4 w-4 rounded border-neutral-300 text-telisik focus:ring-telisik"
                            checked={searchFilters.lokasi}
                            onChange={handleSearchFilterChange("lokasi")}
                          />
                          <span className="text-neutral-600">Lokasi</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2 h-4 w-4 rounded border-neutral-300 text-telisik focus:ring-telisik"
                            checked={searchFilters.jenisKonflik}
                            onChange={handleSearchFilterChange("jenisKonflik")}
                          />
                          <span className="text-neutral-600">
                            Jenis Konflik
                          </span>
                        </label>
                      </div>

                      <div className="pl-5">
                        <div className="mb-2 italic text-neutral-500">
                          Area pencarian:
                        </div>
                        <div className="ml-2 grid grid-cols-2 gap-2 text-sm text-neutral-700">
                          {searchAreaOptions.map((option) => (
                            <label
                              key={option.key}
                              className="flex items-center"
                            >
                              <input
                                type="checkbox"
                                className="mr-2 h-4 w-4 rounded border-neutral-300 text-telisik focus:ring-telisik"
                                checked={searchFilters[option.key]}
                                onChange={handleSearchFilterChange(option.key)}
                              />
                              {option.label}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end mt-3">
                        <Button
                          className="rounded-full bg-[#6b7c5a] hover:bg-[#5f6f50] active:bg-[#516046]"
                          onClick={handleSearch}
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
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {canEdit && (
                <div
                  className={`admin-edit-panel mb-4 rounded-2xl border-2 border-blue-300 bg-blue-50 p-4 shadow-sm shadow-blue-100 ${
                    isEditMode ? "admin-edit-panel-active" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <label className="flex items-center mb-0">
                      <input
                        className="admin-edit-toggle mr-2 h-4 w-4 rounded border-neutral-300 text-green-600 focus:ring-green-200"
                        type="checkbox"
                        id="editModeToggle"
                        checked={isEditMode}
                        onChange={handleEditModeToggle}
                      />
                    </label>
                    <h3 className="admin-edit-title mb-0 text-xl font-bold text-neutral-700">
                      Tanggapi/Sunting Sekarang
                    </h3>
                    <span
                      className={`admin-edit-status ml-auto rounded-full px-3 py-1 text-xs font-semibold ${
                        isEditMode ? "admin-edit-status-active" : ""
                      }`}
                    >
                      {isEditMode ? "Mode Aktif" : "Mode Nonaktif"}
                    </span>
                  </div>

                  <div className="admin-edit-actions mb-3 flex items-center gap-3 text-[0.95rem] text-neutral-600">
                    <span className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <span className="italic">Tanggapi</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      <span className="italic">Sunting</span>
                    </span>
                  </div>

                  <p className="admin-edit-description mb-0 text-sm leading-6 text-neutral-600">
                    <span className="admin-edit-highlight font-medium text-blue-600">
                      {isDiskursus
                        ? 'Klik tombol "Tanggapi" atau "Sunting" di bawah konten.'
                        : 'Klik tombol "Tanggapi" atau "Sunting" di bawah paragraf sasaran.'}
                    </span>{" "}
                    <span className="admin-edit-subtext italic text-neutral-500">
                      {isDiskursus
                        ? "Jadikan Diskursus ini makin bermutu."
                        : "Jadikan Kronik ini makin perinci terdokumentasi."}
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
