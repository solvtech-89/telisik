import React from "react";

export default function DiskursusCard({ article, apiBase }) {
  if (!article) return null;

  const truncateText = (text, maxLength = 60) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const coverUrl = article.cover?.startsWith("/static/")
    ? `${apiBase}${article.cover}`
    : article.cover;

  return (
    <a href={`/article/diskursus/${article.slug}`} className="group">
      <div className="diskursus-card-shell rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col bg-white">
        {/* Cover Image */}
        {coverUrl && (
          <div
            className="w-full h-40 bg-cover bg-center"
            style={{
              backgroundImage: `url(${coverUrl})`,
            }}
          />
        )}

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Title */}
          <h3 className="diskursus-card-title font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover:text-telisik transition-colors">
            {truncateText(article.title, 60)}
          </h3>

          {/* Excerpt */}
          <p className="diskursus-card-excerpt text-sm text-neutral-600 flex-1 line-clamp-3">
            {truncateText(article.excerpt, 155)}
          </p>

          {/* Footer */}
          <div className="diskursus-card-footer mt-3 pt-3 border-t border-gray-200 text-xs text-neutral-500">
            {article.published_at && (
              <span>
                {new Date(article.published_at).toLocaleDateString("id-ID")}
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
