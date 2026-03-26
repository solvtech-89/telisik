import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import SidebarNav from "../components/SidebarNav";
import { API_BASE } from "../config";
import { Alert, Button, Skeleton } from "../components/ui";

export default function StaticPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const quickLinks = [
    { to: "/pages/about", label: "Tentang" },
    { to: "/pages/help", label: "Bantuan" },
    { to: "/pages/docs", label: "Dokumentasi" },
    { to: "/pages/terms", label: "Syarat & Ketentuan" },
    { to: "/pages/privacy", label: "Kebijakan Privasi" },
  ];

  async function fetchPage() {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/pages/${slug}/`);
      if (!resp.ok) throw new Error();
      const data = await resp.json();
      setPage(data);
      setAlert({ type: "", message: "" });
    } catch {
      setAlert({ type: "danger", message: "Failed to load page." });
      setPage(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="mx-auto grid w-[98%] grid-cols-1 gap-4 py-4 md:grid-cols-[auto,1fr] lg:grid-cols-[auto,1fr,18rem]">
          <div className="hidden md:block md:w-64">
            <Skeleton height="h-[75vh]" />
          </div>
          <div className="space-y-4">
            <Skeleton height="h-5" />
            <Skeleton height="h-10" />
            <Skeleton count={8} />
          </div>
          <div className="hidden lg:block">
            <Skeleton height="h-[50vh]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <div className="mx-auto mt-2 w-[98%] px-1">
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: "", message: "" })}
          onRetry={fetchPage}
        />
      </div>

      <div className="flex-1">
        <div className="h-full">
          <div className="mx-auto flex h-full w-[98%] flex-col md:flex-row">
            <div
              className={`${collapsed ? "md:w-[52px]" : "w-full md:w-64"} hidden h-full overflow-y-auto border-r border-neutral-200 pb-5 transition-[width] duration-200 md:block`}
            >
              <SidebarNav
                collapsed={collapsed}
                onToggle={() => setCollapsed(!collapsed)}
              />
            </div>
            <div
              className="flex-1 overflow-y-auto pb-5 md:max-h-[calc(100vh-120px)]"
            >
              <div className="p-3">
                <div className="flex items-center gap-2 px-1 text-sm">
                  <Link to="/" className="text-telisik hover:text-telisik-dark">
                    Beranda
                  </Link>
                  <span className="text-neutral-400">/</span>
                  <div className="font-semibold text-neutral-800">
                    {page.title}
                  </div>
                </div>
              </div>

              <div className="px-3 pb-3">
                <h1 className="mb-3 text-3xl font-bold text-neutral-900 md:text-4xl">
                  {page.title}
                </h1>
                {page.version && (
                  <div className="mb-4 italic text-neutral-500">
                    Versi {page.version} · Terakhir diperbarui{" "}
                    {new Date(page.updated_at).toLocaleDateString()}
                  </div>
                )}
              </div>

              {page ? (
                <div className="px-3 pb-6 text-base leading-7 text-neutral-700 whitespace-pre-line">
                  {page.content}
                </div>
              ) : (
                <div className="px-3 pb-6">
                  <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-neutral-600 shadow-sm">
                    <p className="mb-4">Halaman tidak tersedia.</p>
                    <Button onClick={fetchPage}>Coba Lagi</Button>
                  </div>
                </div>
              )}
            </div>

            <aside
              className="hidden h-full overflow-y-auto border-l border-neutral-200 bg-white lg:block lg:w-72 lg:max-h-[calc(100vh-120px)]"
            >
              <div className="p-4">
                <h5 className="mb-3 text-base font-semibold text-neutral-900">
                  Navigasi
                </h5>
                <ul className="space-y-2">
                  {quickLinks.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="text-neutral-700 transition-colors hover:text-telisik"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
