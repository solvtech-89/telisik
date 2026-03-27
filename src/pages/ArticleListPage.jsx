import { useEffect, useState, useRef } from "react";
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
    <div className="article-list-shell min-h-screen bg-neutral-50 xl:h-[calc(100vh-104px)] xl:min-h-0 xl:overflow-hidden">
      <div className="article-list-wrap mx-auto max-w-7xl w-full px-3 xl:h-full xl:min-h-0">
        <div className="article-list-grid grid grid-cols-1 gap-6 xl:h-full xl:grid-cols-[260px_minmax(0,1fr)_350px] xl:gap-6 xl:overflow-hidden">
          {/* Left Sidebar Navigation */}
          <div className="article-list-left hidden xl:block xl:h-full xl:overflow-y-scroll xl:overflow-x-hidden xl:overscroll-contain">
            <SidebarNav />
          </div>

          {/* Main Content */}
          <div className="article-list-main relative z-0 min-w-0 overflow-x-hidden px-5 pt-5 xl:h-full xl:overflow-y-scroll xl:overscroll-contain xl:px-6 xl:pt-6">
            <h1 className="article-list-title mb-4 text-2xl font-semibold text-neutral-900">
              {capitalize(tipe)}
            </h1>
            <p className="article-list-subtitle mb-4 text-sm italic text-neutral-600">
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
              <div className="grid grid-cols-1 gap-7 items-start sm:grid-cols-2 xl:grid-cols-3">
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
                <div className="grid grid-cols-1 gap-7 items-start sm:grid-cols-2 xl:grid-cols-3">
                  {articles.map((a) => (
                    <div key={a.id} className="col-span-1">
                      <ArticleCardGrid article={a} />
                    </div>
                  ))}
                </div>

                {/* Infinite Scroll Observer Target */}
                <div ref={observerTarget} className="mt-6 mb-6">
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
              <div className="article-list-empty rounded-lg border border-gray-200 bg-white py-12 text-center">
                <p className="text-neutral-600">
                  {category && category !== "semua"
                    ? `Tidak ada artikel dalam kategori ${getCategoryLabel()}`
                    : "Tidak ada artikel yang ditemukan."}
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="article-list-right article-list-right-panel relative z-10 min-w-0 hidden xl:block xl:h-full xl:overflow-y-scroll xl:overflow-x-hidden xl:overscroll-contain">
            <RightSidebar currentType={tipe} />
          </div>
        </div>
      </div>
    </div>
  );
}
