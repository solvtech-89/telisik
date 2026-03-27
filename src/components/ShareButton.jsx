import React, { useState } from "react";
import { createShareLink } from "../utils/tracking";

export const ShareButton = ({
  contentType,
  objectId,
  title,
  className = "",
}) => {
  const [shareUrl, setShareUrl] = useState("");
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async (platform) => {
    const shareData = await createShareLink(contentType, objectId, platform);

    if (!shareData) {
      alert("Failed to create share link");
      return;
    }

    const fullUrl = `${window.location.origin}${shareData.share_url}`;
    setShareUrl(fullUrl);

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
          "_blank",
        );
        break;

      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
          "_blank",
        );
        break;

      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(title + " " + fullUrl)}`,
          "_blank",
        );
        break;

      case "telegram":
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
          "_blank",
        );
        break;

      case "copy":
      default:
        // Copy to clipboard
        navigator.clipboard.writeText(fullUrl).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        break;
    }

    setShowShareMenu(false);
  };

  return (
    <div className="share-button-container relative">
      <button
        className={`inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 ${className}`}
        onClick={() => setShowShareMenu(!showShareMenu)}
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>{" "}
        Bagikan
        {copied && <span className="ml-2 text-emerald-600">✓ Disalin</span>}
      </button>

      {showShareMenu && (
        <div className="share-menu absolute right-0 top-full z-30 mt-2 min-w-[200px] rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
          <button
            className="mb-1 block w-full rounded px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => handleShare("copy")}
            type="button"
          >
            🔗 Salin Link
          </button>
          <button
            className="mb-1 block w-full rounded px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => handleShare("whatsapp")}
            type="button"
          >
            💬 WhatsApp
          </button>
          <button
            className="mb-1 block w-full rounded px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => handleShare("twitter")}
            type="button"
          >
            🐦 Twitter
          </button>
          <button
            className="mb-1 block w-full rounded px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => handleShare("facebook")}
            type="button"
          >
            📘 Facebook
          </button>
          <button
            className="block w-full rounded px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => handleShare("telegram")}
            type="button"
          >
            ✈️ Telegram
          </button>
        </div>
      )}
    </div>
  );
};
