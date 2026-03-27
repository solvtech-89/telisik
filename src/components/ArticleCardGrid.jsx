import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatCount } from "../utils/tracking";
import { API_BASE } from "../config";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function ArticleCardGrid({ article }) {
  const mediaBase = API_BASE || "https://api.telisik.org";
  const articleUrl = article.type
    ? `/article/${article.type.toLowerCase()}/${article.slug}`
    : `/article/diskursus/${article.slug}`;

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

  const imageSource = article.featured_image || article.cover || "";
  const imageUrl = imageSource.startsWith("/static/")
    ? `${mediaBase}${imageSource}`
    : imageSource;
  const [showImage, setShowImage] = useState(Boolean(imageUrl));

  useEffect(() => {
    setShowImage(Boolean(imageUrl));
  }, [imageUrl, article.slug]);

  const excerptText = article.lead_excerpt || article.excerpt;

  return (
    <article
      className={`article-feed-card overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md ${
        !showImage ? "article-feed-card--no-image" : ""
      }`}
    >
      {showImage && imageUrl ? (
        <Link to={articleUrl} className="article-feed-thumb-wrap block">
          <img
            src={imageUrl}
            alt={article.title}
            className="article-feed-thumb h-[clamp(170px,15vw,228px)] w-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setShowImage(false)}
          />
        </Link>
      ) : (
        <div className="article-feed-thumb-placeholder" aria-hidden="true" />
      )}

      <div className="article-feed-body space-y-3 p-4">
        <div className="article-feed-meta flex items-center gap-2">
          {article.type && (
            <span
              className={`article-feed-type-badge rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white ${typeColors[article.type] || "bg-gray-600"}`}
            >
              {article.type}
            </span>
          )}
          {locationName && (
            <span className="article-feed-location text-xs text-gray-500">
              {locationName}
            </span>
          )}
        </div>

        <h3 className="article-feed-title text-lg font-semibold leading-tight text-telisik">
          <Link
            to={articleUrl}
            className="line-clamp-2 transition-colors hover:text-[#0068d6]"
          >
            {article.title}
          </Link>
        </h3>

        {excerptText && (
          <p className="article-feed-excerpt line-clamp-4 text-sm leading-relaxed text-gray-600">
            {excerptText}
          </p>
        )}

        <div className="article-feed-stats flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
          {article.created_at && <span>{formatDate(article.created_at)}</span>}
          {article.views !== undefined && (
            <span>{formatCount(article.views)} dilihat</span>
          )}
          {article.comments_count !== undefined && (
            <span>{formatCount(article.comments_count)} komentar</span>
          )}
        </div>

        {article.metadata?.tags?.length > 0 && (
          <div className="article-feed-tags flex flex-wrap gap-1.5 pt-1">
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
    </article>
  );
}
