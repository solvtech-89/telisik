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

  return (
    <div className="mb-4 shadow-sm border rounded overflow-hidden">
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
                className="w-full h-48 object-cover"
                style={{
                  width: "100%",
                }}
              />
            </Link>
          </div>
        )}

        <div className={article.featured_image ? "md:col-span-2 p-4" : "p-4"}>
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span
                className="px-2 py-1 text-xs rounded"
                style={{
                  backgroundColor:
                    article.type === "TILIK" ? "#FF6B35" : "#4ECDC4",
                  color: "white",
                }}
              >
                {article.type}
              </span>
              {locationName && (
                <span className="ml-2 text-gray-500 text-xs">
                  📍 {locationName}
                </span>
              )}
            </div>

            <h5 className="text-lg font-semibold">
              <Link
                to={articleUrl}
                className="no-underline text-gray-900 block"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {article.title}
              </Link>
            </h5>

            {article.lead_excerpt && (
              <p className="text-gray-500 text-xs mb-2">
                {truncateText(article.lead_excerpt, 150)}
              </p>
            )}

            <div className="flex justify-between items-center mt-3">
              <div className="text-gray-500 text-xs">
                {article.created_at && (
                  <span>📅 {formatDate(article.created_at)}</span>
                )}
              </div>

              <div className="text-gray-500 text-xs flex gap-3">
                {article.views !== undefined && (
                  <span>👁️ {formatCount(article.views)}</span>
                )}
                {article.comments_count !== undefined && (
                  <span>💬 {formatCount(article.comments_count)}</span>
                )}
              </div>
            </div>

            {article.metadata?.tags && article.metadata.tags.length > 0 && (
              <div className="mt-2">
                {article.metadata.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 text-gray-800 mr-1 px-2 py-0.5 rounded text-sm"
                    style={{ fontSize: "0.75rem" }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
