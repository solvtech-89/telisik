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

export default function ArticleCardGrid({ article, variant = "default" }) {
  const mediaBase = API_BASE || "https://api.telisik.org";
  const isHomeVariant = variant === "home";
  const articleUrl = article.type
    ? `/article/${article.type.toLowerCase()}/${article.slug}`
    : `/article/diskursus/${article.slug}`;

  // Get location name from geojson if available
  const locationName =
    article.location_geojson?.properties?.city ||
    article.location_geojson?.properties?.name ||
    "";

  const imageSource = article.featured_image || article.cover || "";
  const imageUrl = imageSource.startsWith("/static/")
    ? `${mediaBase}${imageSource}`
    : imageSource;
  const [showImage, setShowImage] = useState(Boolean(imageUrl));

  useEffect(() => {
    setShowImage(Boolean(imageUrl));
  }, [imageUrl, article.slug]);

  const excerptTextRaw = article.lead_excerpt || article.excerpt || "";
  const excerptText =
    excerptTextRaw.length > 155
      ? excerptTextRaw.substring(0, 155) + "..."
      : excerptTextRaw;

  return (
    <article
      className={`article-feed-card overflow-hidden w-full ${!showImage ? "article-feed-card--no-image" : ""}`}
      aria-label={article.title}
    >
      {showImage && imageUrl ? (
        <Link to={articleUrl} className="article-feed-thumb-wrap block">
          <img
            src={imageUrl}
            alt={article.title}
            className="article-feed-thumb w-full object-cover"
            style={{ aspectRatio: "4 / 3" }}
            loading="lazy"
            decoding="async"
            onError={() => setShowImage(false)}
          />
        </Link>
      ) : (
        <div className="article-feed-thumb-placeholder" aria-hidden="true" />
      )}

      <div
        className={
          isHomeVariant
            ? "article-feed-body pt-2 px-0 w-full"
            : "article-feed-body p-0 px-0 w-full"
        }
      >
        <h3
          className={
            isHomeVariant
              ? "article-feed-title text-sm font-bold leading-snug text-left mb-1"
              : "article-feed-title text-lg font-semibold leading-tight text-left mt-2 mb-0"
          }
          style={{ textAlign: "left" }}
        >
          <Link
            to={articleUrl}
            className={
              isHomeVariant
                ? "transition-colors hover:opacity-90 block w-full"
                : "transition-colors hover:text-[#dc5b2b] block w-full"
            }
          >
            {article.title}
          </Link>
        </h3>

        {excerptText && (
          <p
            className={
              isHomeVariant
                ? "article-feed-excerpt text-xs leading-relaxed text-gray-600 line-clamp-3 overflow-hidden mt-0"
                : "article-feed-excerpt text-sm leading-relaxed text-gray-600 line-clamp-3 overflow-hidden mt-0"
            }
          >
            {excerptTextRaw}
          </p>
        )}

        {!isHomeVariant && (
          <div className="article-feed-stats flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            {/* {article.created_at && (
              <span>{formatDate(article.created_at)}</span>
            )} */}
            {/* {article.views !== undefined && (
              <span>{formatCount(article.views)} dilihat</span>
            )}
            {article.comments_count !== undefined && (
              <span>{formatCount(article.comments_count)} komentar</span>
            )} */}
          </div>
        )}
      </div>
    </article>
  );
}
