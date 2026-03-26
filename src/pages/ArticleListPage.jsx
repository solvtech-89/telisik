import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import SidebarNav from "../components/SidebarNav";
import ArticleCardGrid from "../components/ArticleCardGrid";
import RightSidebar from "../components/RightSidebar";
import { API_BASE } from "../config";
import { Alert, Skeleton } from "../components/ui";

export default function ArticleListPage() {
  const { tipe } = useParams();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");

  const [articles, setArticles] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observerTarget = useRef(null);

  async function fetchList(p, append = false) {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      let url = `${API_BASE}/api/article/${tipe}/?page=${p}`;
      if (category && category !== "semua") {
        url += `&category=${category}`;
      }

      const resp = await fetch(url);
      if (!resp.ok) throw new Error("Load failed");
      const data = await resp.json();

      const newArticles = data.results || data.articles || [];
      const count = data.count || newArticles.length;

      if (append) {
        setArticles((prev) => [...prev, ...newArticles]);
      } else {
        setArticles(newArticles);
      }

      setTotalCount(count);
      setHasMore(!!data.next);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    setArticles([]);
    setPage(1);
    setHasMore(true);
    fetchList(1, false);
  }, [tipe, category]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchList(nextPage, true);
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingMore, loading, page]);

  const getCategoryLabel = () => {
    if (!category || category === "semua") return "Semua Kategori";
    const categoryMap = {
      agraria: "Agraria",
      ekosospol: "Ekosospol",
      "sumber-daya-alam": "Sumber Daya Alam",
    };
    return categoryMap[category] || category;
  };

  function capitalize(str) {
    if (typeof str !== "string" || str.length === 0) {
      return "";
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="w-[98%] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Left Sidebar Navigation */}
          <div className="hidden md:block md:col-span-2 overflow-y-auto max-h-[calc(100vh-60px)]">
            <SidebarNav />
          </div>

          {/* Main Content */}
          <div className="md:col-span-7 px-3 md:px-2 pt-3 overflow-y-auto max-h-[calc(100vh-60px)]">
            <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
              {capitalize(tipe)}
            </h1>
            <p className="text-sm text-neutral-600 mb-4 italic">
              {tipe === "kronik"
                ? "Dokumentasi konflik yang sedang berlangsung."
                : "Dokumentasi potensi konflik yang bisa terjadi."}
            </p>

            {/* Category Filter Badge */}
            {category && category !== "semua" && (
              <div className="mb-4">
                <Alert
                  type="info"
                  message={
                    <>
                      Menampilkan: <strong>{getCategoryLabel()}</strong>
                    </>
                  }
                />
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton height="h-40" />
                      <Skeleton count={2} />
                    </div>
                  ))}
              </div>
            ) : articles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {articles.map((a) => (
                    <div key={a.id} className="col-span-1">
                      <ArticleCardGrid article={a} />
                    </div>
                  ))}
                </div>

                {/* Infinite Scroll Observer Target */}
                <div ref={observerTarget} className="mt-4 mb-4">
                  {/* Loading More Indicator */}
                  {loadingMore && (
                    <div className="flex flex-col items-center py-8">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-neutral-400 bounce-dot bounce-dot-1" />
                        <div className="w-3 h-3 rounded-full bg-neutral-400 bounce-dot bounce-dot-2" />
                        <div className="w-3 h-3 rounded-full bg-neutral-400 bounce-dot bounce-dot-3" />
                      </div>
                    </div>
                  )}

                  {/* End of List Indicator */}
                  {!hasMore && totalCount > 0 && !loadingMore && (
                    <div className="text-center py-8">
                      <p className="text-neutral-600">
                        Menampilkan semua {articles.length} dari {totalCount}{" "}
                        artikel
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-neutral-600">
                  {category && category !== "semua"
                    ? `Tidak ada artikel dalam kategori ${getCategoryLabel()}`
                    : "Tidak ada artikel yang ditemukan."}
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="hidden md:block md:col-span-3 overflow-y-auto max-h-[calc(100vh-60px)]">
            <RightSidebar currentType={tipe} />
          </div>
        </div>
      </div>
    </div>
  );
}
