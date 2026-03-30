import React from "react";
import ArticleImageGallery from "./ArticleImageGallery";
import { API_BASE } from "../config";

function resolveAssetUrl(path) {
  if (!path) return "";
  return path.startsWith("/static/") ? `${API_BASE}${path}` : path;
}

function formatArticleDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ArticleHeader({
  article,
  contributor,
  isDiskursus,
  slug,
  tipe,
  canEdit,
}) {
  const primaryContributor = Array.isArray(contributor) ? contributor[0] : null;
  const contributorName = primaryContributor?.username || "Kontributor";
  const contributorAvatar = resolveAssetUrl(
    primaryContributor?.avatar_url || "",
  );
  const coverUrl = resolveAssetUrl(article.cover || article.cover_url || "");
  const resensiMeta = [
    { label: "Judul Buku", value: article.book_title },
    { label: "Penulis", value: article.book_author },
    { label: "Penerbit", value: article.book_publisher },
    {
      label: "Tahun",
      value: Number(article.book_year) > 0 ? article.book_year : "",
    },
  ].filter((item) => item.value);

  return (
    <div className="space-y-4 px-3 pb-3">
      <h1 className="text-3xl font-bold text-[#555333]">{article.title}</h1>

      {isDiskursus ? (
        <>
          {article.excerpt && (
            <div className="text-xl font-semibold leading-snug text-telisik">
              {article.excerpt}
            </div>
          )}

          {primaryContributor && (
            <div className="flex items-center gap-3 border-b border-neutral-200 pb-3">
              {contributorAvatar ? (
                <img
                  src={contributorAvatar}
                  alt={`Foto profil ${contributorName}`}
                  className="h-8 w-8 rounded-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600">
                  {contributorName.slice(0, 1).toUpperCase()}
                </span>
              )}
              <div>
                <div className="font-semibold text-neutral-900">
                  {contributorName}
                </div>
                <div className="text-sm text-neutral-500">
                  {formatArticleDate(article.created_at)}
                </div>
              </div>
            </div>
          )}

          {coverUrl && (
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <img
                src={coverUrl}
                alt={article.title}
                className="max-h-[400px] w-full object-cover"
              />
            </div>
          )}

          {article.content_type === "resensi" && resensiMeta.length > 0 && (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
              {resensiMeta.map((item, index) => (
                <div
                  key={item.label}
                  className={index < resensiMeta.length - 1 ? "mb-2" : ""}
                >
                  <strong>{item.label}:</strong> {item.value}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {article.lead_excerpt && (
            <div className="text-xl font-semibold leading-snug text-telisik">
              {article.lead_excerpt}
            </div>
          )}
          <ArticleImageGallery
            slug={slug}
            tipe={tipe}
            canEdit={canEdit}
            contributors={contributor}
          />
        </>
      )}
    </div>
  );
}
