import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import SidebarNav from "../components/SidebarNav";
import RightSidebar from "../components/RightSidebar";
import MapContainer from "../components/MapContainer";
import DiskursusCard from "../components/DiskursusCard";
import CategoryFilter from "../components/CategoryFilter";
import KredoBox from "../components/KredoBox";
import { Skeleton, Alert } from "../components/ui";

export default function HomePage() {
  const [diskursus, setDiskursus] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
        setDiskursus(res.data?.results || []);
        setTotalPages(res.data?.total_pages || 1);
        setCurrentPage(page);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadDiskursus(1);
  }, [loadDiskursus]);

  // Handle category toggle
  const handleCategoryToggle = (category) => {
    setActiveCategories((prev) => {
      const newSet = new Set(prev);
      newSet.has(category) ? newSet.delete(category) : newSet.add(category);
      return newSet;
    });
  };

  // Determine items to display based on screen size
  const displayCount =
    typeof window !== "undefined" && window.innerWidth < 768 ? 3 : 12;
  const displayedArticles = diskursus.slice(0, displayCount);

  return (
    <div className="min-h-screen bg-neutral-50">
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
      <div className="flex flex-col lg:flex-row h-full">
        {/* Left Sidebar - Navigation */}
        <div className="hidden lg:block w-64 border-r border-gray-200 bg-white overflow-y-auto">
          <SidebarNav />
        </div>

        {/* Center - Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
            {/* Map Section */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                  Peta Konflik
                </h2>
                <p className="text-neutral-600">
                  Eksplorasi konflik pertanahan di seluruh Indonesia
                </p>
              </div>

              <MapContainer
                markers={markers}
                activeCategories={activeCategories}
                onCategoryToggle={handleCategoryToggle}
              />
            </div>

            {/* Category Filter */}
            <CategoryFilter
              activeCategories={activeCategories}
              onCategoryToggle={handleCategoryToggle}
            />

            {/* Kredo Box */}
            {kredo.heading && (
              <KredoBox
                heading={kredo.heading}
                lead={kredo.lead}
                body={kredo.body}
              />
            )}

            {/* Diskursus Section */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  Diskursus Terbaru
                </h2>
                <p className="text-neutral-600 mt-1">
                  Baca artikel dan analisis terkini
                </p>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedArticles.map((article) => (
                    <DiskursusCard
                      key={article.id}
                      article={article}
                      apiBase={API_BASE}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => loadDiskursus(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sebelumnya
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => loadDiskursus(page)}
                          className={`
                            w-8 h-8 rounded text-sm font-medium transition-colors
                            ${
                              page === currentPage
                                ? "bg-telisik text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                            }
                          `}
                        >
                          {page}
                        </button>
                      ),
                    )}
                  </div>

                  <button
                    onClick={() => loadDiskursus(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Secondary Info */}
        <div className="hidden xl:block w-80 border-l border-gray-200 bg-white overflow-y-auto">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
