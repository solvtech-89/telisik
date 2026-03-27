import React from "react";
import { Link } from "react-router-dom";
import { formatCount } from "../utils/tracking";
import { API_BASE } from "../config";

const truncateText = (text, maxLength = 150) => {
  if (!text) return "";
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function ArticleCard({ article }) {
  const articleUrl = `/article/${article.type.toLowerCase()}/${article.slug}`;

  // Get location name from geojson if available
  const locationName =
    article.location_geojson?.properties?.city ||
    article.location_geojson?.properties?.name ||
    "";

  const typeColors = {
    TILIK: "bg-[#ff6b35]",
    KRONIK: "bg-[#0068d6]",
    DISKURSUS: "bg-[#0f766e]",
  };

  return (
    <article className="mb-4 overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div
        className={`grid grid-cols-1 ${article.featured_image ? "md:grid-cols-3" : "md:grid-cols-1"}`}
      >
        {article.featured_image && (
          <div className="md:col-span-1">
            <Link to={articleUrl}>
              <img
                src={
                  article.featured_image.startsWith("/static/")
                    ? `${API_BASE}${article.featured_image}`
                    : article.featured_image
                }
                alt={article.title}
                className="h-48 w-full object-cover"
              />
            </Link>
          </div>
        )}

        <div className={article.featured_image ? "md:col-span-2 p-4" : "p-4"}>
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white ${typeColors[article.type] || "bg-gray-600"}`}
              >
                {article.type}
              </span>
              {locationName && (
                <span className="ml-2 text-xs text-gray-500">
                  {locationName}
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold leading-tight text-telisik">
              <Link
                to={articleUrl}
                className="block line-clamp-2 text-gray-900 no-underline transition-colors hover:text-[#0068d6]"
              >
                {article.title}
              </Link>
            </h3>

            {article.lead_excerpt && (
              <p className="mb-2 text-sm leading-relaxed text-gray-600">
                {truncateText(article.lead_excerpt, 150)}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
              <div>
                {article.created_at && (
                  <span>{formatDate(article.created_at)}</span>
                )}
              </div>

              <div className="flex gap-3">
                {article.views !== undefined && (
                  <span>{formatCount(article.views)} dilihat</span>
                )}
                {article.comments_count !== undefined && (
                  <span>{formatCount(article.comments_count)} komentar</span>
                )}
              </div>
            </div>

            {article.metadata?.tags && article.metadata.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {article.metadata.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
