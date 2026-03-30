import React, { useEffect, useState } from "react";
import { API_BASE } from "../config";

const truncateTitleText = (title, maxLength = 60) => {
  if (!title) return "";
  return title.length > maxLength
    ? title.substring(0, maxLength) + "..."
    : title;
};

export default function RightSidebar({ currentType = null, isDetail = false }) {
  const mediaBase = API_BASE || "https://api.telisik.org";
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    tilik: [],
    kronik: [],
    banners: [],
  });
  const [searchFilters, setSearchFilters] = useState({
    lokasi: false,
    jenisKonflik: false,
    kronik: true,
    tilik: true,
    diskursus: true,
    tanggapan: true,
  });
  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedRegency, setSelectedRegency] = useState("");
  const conflictOptions = [
    { id: "sda", label: "Pemanfaatan SDA" },
    { id: "agraria", label: "Agraria/pemanfaatan lahan" },
    { id: "ekonomi", label: "Ekonomi, sosial, politik, SARA" },
  ];
  const [selectedConflictTypes, setSelectedConflictTypes] = useState([]);

  useEffect(() => {
    fetchRightSidebarData();
  }, []);

  const fetchRightSidebarData = async () => {
    try {
      setLoading(true);

      const [tilikRes, kronikRes, bannersRes] = await Promise.all([
        fetch(`${API_BASE}/api/article/tilik/?limit=6`),
        fetch(`${API_BASE}/api/article/kronik/?limit=6`),
        fetch(`${API_BASE}/api/banners/`),
      ]);

      if (!tilikRes.ok || !kronikRes.ok || !bannersRes.ok) {
        throw new Error("Failed to fetch sidebar data");
      }

      const [tilikData, kronikData, bannersData] = await Promise.all([
        tilikRes.json(),
        kronikRes.json(),
        bannersRes.json(),
      ]);

      setData({
        tilik: tilikData.results || [],
        kronik: kronikData.results || [],
        banners: bannersData.banners || [],
      });
    } catch (error) {
      console.error("Error fetching sidebar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBannerByPosition = (position) => {
    const { banners } = data;
    const valid = banners.filter(
      (b) => b.position === position && new Date(b.expires_at) > new Date(),
    );
    return valid.length > 0
      ? valid[Math.floor(Math.random() * valid.length)]
      : null;
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("q", searchQuery);
    if (searchFilters.lokasi) params.append("lokasi", "1");
    if (selectedProvince) params.append("province", selectedProvince);
    if (selectedRegency) params.append("regency", selectedRegency);
    if (searchFilters.jenisKonflik) params.append("jenis_konflik", "1");
    if (searchFilters.jenisKonflik && selectedConflictTypes.length) {
      params.set("jenis_konflik", selectedConflictTypes.join(","));
    }

    const types = [];
    if (searchFilters.kronik) types.push("kronik");
    if (searchFilters.tilik) types.push("tilik");
    if (searchFilters.diskursus) types.push("diskursus");
    if (searchFilters.tanggapan) types.push("tanggapan");
    if (types.length > 0) params.append("types", types.join(","));

    window.location.href = `/search?${params.toString()}`;
  };

  // Load provinces when advanced search shown and lokasi enabled
  useEffect(() => {
    if (!showAdvancedSearch || !searchFilters.lokasi) return;

    const fetchProvinces = async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/locations/provinces/`);
        if (!resp.ok) return;
        const data = await resp.json();
        setProvinces(data.results || data || []);
      } catch (err) {
        console.error("Failed to load provinces", err);
      }
    };

    fetchProvinces();
  }, [showAdvancedSearch, searchFilters.lokasi]);

  // Load regencies when a province selected
  useEffect(() => {
    if (!selectedProvince) {
      setRegencies([]);
      setSelectedRegency("");
      return;
    }

    const fetchRegencies = async () => {
      try {
        const resp = await fetch(
          `${API_BASE}/api/locations/regencies/?province=${selectedProvince}`,
        );
        if (!resp.ok) return;
        const data = await resp.json();
        setRegencies(data.results || data || []);
      } catch (err) {
        console.error("Failed to load regencies", err);
      }
    };

    fetchRegencies();
  }, [selectedProvince]);

  const { tilik, kronik } = data;
  const bannerTop = getBannerByPosition("rightsidebar_top");
  const bannerMiddle = getBannerByPosition("rightsidebar_middle");
  const bannerBottom = getBannerByPosition("rightsidebar_bottom");
  const hideBrokenImage = (event) => {
    event.currentTarget.style.display = "none";
  };

  return (
    <div className="right-sidebar-shell px-4 py-3">
      {/* SEARCH BOX WITH ADVANCED FILTER */}
      <div className="right-find-shell mb-4">
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
              className="right-find-input w-full rounded-full border border-[#ddd9ce] bg-[#FFFFFF] px-4 py-2 pr-12 text-[0.95rem] text-[#555333] focus:outline-none focus:ring-2 focus:ring-[#9ab1d3]"
              placeholder="Temukan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />

            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
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
                className="p-1 rounded-full text-gray-600 hover:bg-gray-100"
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
          className={`right-find-advanced ${showAdvancedSearch ? "right-find-advanced-panel rounded border px-3 py-2" : ""}`}
        >
          <label className="right-find-toggle-label flex items-center space-x-2">
            <input
              type="checkbox"
              className="right-find-master-toggle"
              checked={showAdvancedSearch}
              onChange={(e) => setShowAdvancedSearch(e.target.checked)}
            />
            <span className="right-find-label-text italic">
              Perinci pencarian
            </span>
          </label>

          {showAdvancedSearch && (
            <div className="mt-3">
              <div className="mb-3 pl-4 space-y-3">
                <label className="right-find-option flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="right-find-switch"
                    checked={searchFilters.lokasi}
                    onChange={(e) =>
                      setSearchFilters({
                        ...searchFilters,
                        lokasi: e.target.checked,
                      })
                    }
                  />
                  <span className="right-find-label-text">Lokasi</span>
                </label>

                <label className="right-find-option flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="right-find-switch"
                    checked={searchFilters.jenisKonflik}
                    onChange={(e) =>
                      setSearchFilters({
                        ...searchFilters,
                        jenisKonflik: e.target.checked,
                      })
                    }
                  />
                  <span className="right-find-label-text">Jenis Konflik</span>
                </label>
              </div>

              {/* Location selectors: province -> regency */}
              {showAdvancedSearch && searchFilters.lokasi && (
                <div className="mt-3 pl-4">
                  <div className="mb-2">
                    <label className="text-sm font-medium text-neutral-700">
                      Provinsi
                    </label>
                    <select
                      className="mt-1 block w-full rounded border border-[#d9d2bf] bg-white px-3 py-2 text-sm text-[#555333]"
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                    >
                      <option value="">Pilih provinsi...</option>
                      {provinces.map((p) => (
                        <option
                          key={p.id || p.code || p.name}
                          value={p.id || p.code || p.name}
                        >
                          {p.name || p.province_name || p.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="text-sm font-medium text-neutral-700">
                      Kabupaten / Kota
                    </label>
                    <select
                      className="mt-1 block w-full rounded border border-[#d9d2bf] bg-white px-3 py-2 text-sm text-[#555333]"
                      value={selectedRegency}
                      onChange={(e) => setSelectedRegency(e.target.value)}
                      disabled={!regencies || regencies.length === 0}
                    >
                      <option value="">Pilih kabupaten / kota...</option>
                      {regencies.map((r) => (
                        <option
                          key={r.id || r.code || r.name}
                          value={r.id || r.code || r.name}
                        >
                          {r.name || r.regency_name || r.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {showAdvancedSearch && searchFilters.jenisKonflik && (
                <div className="mt-3 pl-4">
                  <div className="mb-2">
                    <div className="text-sm font-medium text-neutral-700 mb-1">
                      Jenis Konflik
                    </div>
                    <div className="space-y-2">
                      {conflictOptions.map((opt) => (
                        <label
                          key={opt.id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            className="right-find-checkbox"
                            checked={selectedConflictTypes.includes(opt.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedConflictTypes((s) => [...s, opt.id]);
                              } else {
                                setSelectedConflictTypes((s) =>
                                  s.filter((x) => x !== opt.id),
                                );
                              }
                            }}
                          />
                          <span className="text-sm text-[#555333]">
                            {opt.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <hr className="mb-3" />

              <div className="mt-0">
                <div className="right-find-area-title italic mb-2">
                  Area pencarian:
                </div>
                <div className="right-find-area-grid right-find-area-grid--home">
                  <label className="right-find-option right-find-area-option">
                    <input
                      type="checkbox"
                      className="right-find-checkbox"
                      checked={searchFilters.kronik}
                      onChange={(e) =>
                        setSearchFilters({
                          ...searchFilters,
                          kronik: e.target.checked,
                        })
                      }
                    />
                    <span className="right-find-area-text text-telisik">
                      Kronik
                    </span>
                  </label>
                  <label className="right-find-option right-find-area-option">
                    <input
                      type="checkbox"
                      className="right-find-checkbox"
                      checked={searchFilters.tilik}
                      onChange={(e) =>
                        setSearchFilters({
                          ...searchFilters,
                          tilik: e.target.checked,
                        })
                      }
                    />

                    <span className="right-find-area-text">Tilik</span>
                  </label>
                  <label className="right-find-option right-find-area-option">
                    <input
                      type="checkbox"
                      className="right-find-checkbox"
                      checked={searchFilters.diskursus}
                      onChange={(e) =>
                        setSearchFilters({
                          ...searchFilters,
                          diskursus: e.target.checked,
                        })
                      }
                    />
                    <span className="right-find-area-text">Diskursus</span>
                  </label>
                  <label className="right-find-option right-find-area-option">
                    <input
                      type="checkbox"
                      className="right-find-checkbox"
                      checked={searchFilters.tanggapan}
                      onChange={(e) =>
                        setSearchFilters({
                          ...searchFilters,
                          tanggapan: e.target.checked,
                        })
                      }
                    />
                    <span className="right-find-area-text">Tanggapan</span>
                  </label>
                </div>
              </div>

              <div className="right-find-submit-row flex mt-3 justify-end">
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
                    className="inline-block mr-2"
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

      {/* Top Banner */}
      {bannerTop && (
        <div className="mb-3">
          <a href={bannerTop.url} target="_blank" rel="noopener noreferrer">
            <img
              src={
                bannerTop.image.startsWith("/static/")
                  ? `${mediaBase}${bannerTop.image}`
                  : bannerTop.image
              }
              alt={bannerTop.title}
              className="right-banner-image w-full rounded-none shadow-sm object-cover"
              style={{ aspectRatio: "2/1" }}
              onError={hideBrokenImage}
            />
          </a>
        </div>
      )}

      {/* KRONIK SECTION - Hide if we're on Kronik page */}
      {currentType !== "kronik" && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3
              className="right-feed-heading font-bold text-[#f26532] text-2xl mb-0"
              style={{ color: "#FC6736" }}
            >
              Kronik
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-3">
              <svg
                className="animate-spin h-5 w-5 mx-auto text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
            </div>
          ) : kronik.length ? (
            <>
              {kronik.map((item, index) => (
                <div key={item.id}>
                  {index === 0 ? (
                    <div className="right-feed-lead-card mb-3 bg-transparent">
                      {item.featured_image && (
                        <a href={`/article/kronik/${item.slug}`}>
                          <img
                            src={
                              item.featured_image.startsWith("/static/")
                                ? `${mediaBase}${item.featured_image}`
                                : item.featured_image
                            }
                            alt={item.title}
                            className="right-feed-lead-image w-full"
                            style={{ aspectRatio: "2/1", objectFit: "cover" }}
                            onError={hideBrokenImage}
                          />
                        </a>
                      )}
                      <div className="px-0">
                        <h4 className="font-bold text-lg">
                          <a
                            href={`/article/kronik/${item.slug}`}
                            className="right-feed-lead-link font-bold text-[#f26532] no-underline"
                          >
                            {truncateTitleText(item.title, 60)}
                          </a>
                        </h4>
                        {item.lead_excerpt && (
                          <p className="right-feed-lead-excerpt text-gray-500">
                            {truncateTitleText(item.lead_excerpt, 100)}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="right-feed-item-row mb-3">
                      <div className="flex gap-2">
                        <div className="w-1/6">
                          {item.featured_image && (
                            <a href={`/article/kronik/${item.slug}`}>
                              <img
                                src={
                                  item.featured_image.startsWith("/static/")
                                    ? `${mediaBase}${item.featured_image}`
                                    : item.featured_image
                                }
                                alt={item.title}
                                className="right-feed-item-thumb w-full object-cover"
                                style={{ aspectRatio: "1 / 1" }}
                                onError={hideBrokenImage}
                              />
                            </a>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="py-0 pl-2">
                            <h6 className="mb-0 text-sm">
                              <a
                                href={`/article/kronik/${item.slug}`}
                                className="right-feed-item-link text-gray-800 no-underline dark:text-gray-100"
                              >
                                {truncateTitleText(item.title, 60)}
                              </a>
                            </h6>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <p className="text-gray-500">Belum ada Kronik.</p>
          )}
        </div>
      )}

      {/* Middle Banner */}
      {bannerMiddle && (
        <div className="mb-3">
          <a href={bannerMiddle.url} target="_blank" rel="noopener noreferrer">
            <img
              src={
                bannerMiddle.image.startsWith("/static/")
                  ? `${mediaBase}${bannerMiddle.image}`
                  : bannerMiddle.image
              }
              alt={bannerMiddle.title}
              className="right-banner-image w-full rounded-none shadow-sm object-cover"
              style={{ aspectRatio: "2/1" }}
              onError={hideBrokenImage}
            />
          </a>
        </div>
      )}

      {/* TILIK SECTION - Hide if we're on Tilik page */}
      {currentType !== "tilik" && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3
              className="right-feed-heading font-bold text-[#f26532] text-2xl mb-0"
              style={{ color: "#FC6736" }}
            >
              Tilik
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-3">
              <svg
                className="animate-spin h-5 w-5 mx-auto text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
            </div>
          ) : tilik.length ? (
            <>
              {tilik.map((item, index) => (
                <div key={item.id}>
                  {index === 0 ? (
                    <div className="right-feed-lead-card mb-3 bg-transparent">
                      {item.featured_image && (
                        <a href={`/article/tilik/${item.slug}`}>
                          <img
                            src={
                              item.featured_image.startsWith("/static/")
                                ? `${mediaBase}${item.featured_image}`
                                : item.featured_image
                            }
                            alt={item.title}
                            className="right-feed-lead-image w-full"
                            style={{ aspectRatio: "2/1", objectFit: "cover" }}
                            onError={hideBrokenImage}
                          />
                        </a>
                      )}
                      <div className="px-0">
                        <h4 className="font-bold text-lg">
                          <a
                            href={`/article/tilik/${item.slug}`}
                            className="right-feed-lead-link font-bold text-[#f26532] no-underline"
                          >
                            {truncateTitleText(item.title, 60)}
                          </a>
                        </h4>
                        {item.lead_excerpt && (
                          <p className="right-feed-lead-excerpt text-gray-500">
                            {truncateTitleText(item.lead_excerpt, 100)}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="right-feed-item-row mb-3">
                      <div className="flex gap-2">
                        <div className="w-1/6">
                          {item.featured_image && (
                            <a href={`/article/tilik/${item.slug}`}>
                              <img
                                src={
                                  item.featured_image.startsWith("/static/")
                                    ? `${mediaBase}${item.featured_image}`
                                    : item.featured_image
                                }
                                alt={item.title}
                                className="right-feed-item-thumb w-full object-cover"
                                style={{ aspectRatio: "1 / 1" }}
                                onError={hideBrokenImage}
                              />
                            </a>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="py-0 pl-2">
                            <h6 className="mb-0 text-sm">
                              <a
                                href={`/article/tilik/${item.slug}`}
                                className="right-feed-item-link no-underline text-gray-800 dark:text-gray-100"
                              >
                                {truncateTitleText(item.title, 60)}
                              </a>
                            </h6>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <p className="text-gray-500">Belum ada Tilik.</p>
          )}
        </div>
      )}

      {/* Bottom Banner */}
      {bannerBottom && (
        <div className="mt-3">
          <a href={bannerBottom.url} target="_blank" rel="noopener noreferrer">
            <img
              src={
                bannerBottom.image.startsWith("/static/")
                  ? `${mediaBase}${bannerBottom.image}`
                  : bannerBottom.image
              }
              alt={bannerBottom.title}
              className="right-banner-image w-full rounded-none shadow-sm object-cover"
              style={{ aspectRatio: "2/1" }}
              onError={hideBrokenImage}
            />
          </a>
        </div>
      )}
    </div>
  );
}
