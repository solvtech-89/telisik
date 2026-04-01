import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import SidebarNav from "../components/SidebarNav";
import RightSidebar from "../components/RightSidebar";
import MapContainer from "../components/MapContainer";
import ArticleCardGrid from "../components/ArticleCardGrid";
import KredoBox from "../components/KredoBox";
import { Skeleton, Alert } from "../components/ui";

export default function HomePage() {
  const [diskursus, setDiskursus] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [markers, setMarkers] = useState([]);
  const [kredo, setKredo] = useState({});
  const [activeCategories, setActiveCategories] = useState(new Set());

  // Fetch homepage data (markers)
  useEffect(() => {
    axios
      .get(`${API_BASE}/api/homepage/`)
      .then((res) => {
        setMarkers(res.data?.markers || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  // Fetch kredo content
  useEffect(() => {
    axios
      .get(`${API_BASE}/api/kredo/`)
      .then((res) => {
        setKredo(res.data);
      })
      .catch((err) => setError(err.message));
  }, []);

  // Fetch diskursus articles
  const loadDiskursus = useCallback((page) => {
    setLoading(true);

    axios
      .get(`${API_BASE}/api/article/diskursus/?page=${page}&page_size=12`)
      .then((res) => {
        const results = res.data?.results || [];
        const pageSize = 12;
        const count = Number(res.data?.count || results.length || 0);
        const computedTotalPages =
          Number(res.data?.total_pages) ||
          Math.max(1, Math.ceil(count / pageSize));

        setDiskursus(results);
      })
      .catch((err) => setError(err.message))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadDiskursus(1);
  }, [loadDiskursus]);

  useEffect(() => {
    document.documentElement.classList.add("home-lock-page-scroll");
    document.body.classList.add("home-lock-page-scroll");

    return () => {
      document.documentElement.classList.remove("home-lock-page-scroll");
      document.body.classList.remove("home-lock-page-scroll");
    };
  }, []);

  // Handle category toggle
  const handleCategoryToggle = (category) => {
    setActiveCategories((prev) => {
      const newSet = new Set(prev);
      newSet.has(category) ? newSet.delete(category) : newSet.add(category);
      return newSet;
    });
  };

  const displayedArticles = diskursus;

  return (
    <div className="home-shell min-h-screen bg-[#f6f3eb] lg:h-[calc(100vh-60px)] lg:min-h-0 lg:overflow-hidden">
      {/* Error Alert */}
      {error && (
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 p-4">
          <div className="max-w-7xl mx-auto">
            <Alert
              type="danger"
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="home-layout flex min-h-[calc(100vh-60px)] flex-col lg:h-full lg:min-h-0 lg:flex-row lg:overflow-hidden">
        {/* Left Sidebar - Navigation */}
        <aside className="home-left-rail hidden border-r border-[#dfddd4] bg-[#f7f5ef] lg:block lg:h-full lg:w-[265px] lg:overflow-y-auto lg:overflow-x-hidden lg:overscroll-contain xl:w-[275px]">
          <SidebarNav />
        </aside>

        {/* Center - Main Content */}
        <main className="home-main-panel flex-1 bg-[#faf8f1] lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:border-x lg:border-[#e2e0d8]">
          <div className="home-main-inner mx-auto w-full max-w-none space-y-4 px-3 py-3 sm:px-4 sm:py-4 lg:space-y-5 lg:px-4 xl:px-4">
            <div className="space-y-1 lg:space-y-2">
              {/* Map Section */}
              <div>
                <MapContainer
                  markers={markers}
                  activeCategories={activeCategories}
                  onCategoryToggle={handleCategoryToggle}
                  className="rounded-none shadow-none"
                />
              </div>

              {/* Kredo Box */}
              {kredo.heading && (
                <KredoBox
                  heading={kredo.heading}
                  lead={kredo.lead}
                  body={kredo.body}
                />
              )}
            </div>

            {/* Diskursus Section */}
            <div className="home-kredo-cards-wrap space-y-4">
              {/* Loading State */}
              {loading ? (
                <div className="home-kredo-cards-grid grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton height="h-40" />
                        <Skeleton count={2} />
                      </div>
                    ))}
                </div>
              ) : displayedArticles.length > 0 ? (
                <div className="home-kredo-cards-grid grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {displayedArticles.map((article) => (
                    <ArticleCardGrid
                      key={article.id}
                      article={article}
                      variant="home"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <p className="text-neutral-600">
                    Belum ada artikel diskursus
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar - Secondary Info */}
        <aside className="home-right-rail hidden border-l border-[#dfddd4] bg-[#f7f5ef] lg:block lg:h-full lg:w-[385px] lg:overflow-y-auto lg:overflow-x-hidden lg:overscroll-contain xl:w-[395px]">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
}
