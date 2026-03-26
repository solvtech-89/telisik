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
    <div className="share-button-container" style={{ position: "relative" }}>
      <button
        className={`btn btn-outline-secondary ${className}`}
        onClick={() => setShowShareMenu(!showShareMenu)}
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
        {copied && <span className="ml-2 text-success">✓ Disalin</span>}
      </button>

      {showShareMenu && (
        <div
          className="share-menu"
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "0.5rem",
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            padding: "0.5rem",
            zIndex: 1000,
            minWidth: "200px",
          }}
        >
          <button
            className="btn btn-sm btn-light w-100 text-start mb-1"
            onClick={() => handleShare("copy")}
          >
            🔗 Salin Link
          </button>
          <button
            className="btn btn-sm btn-light w-100 text-start mb-1"
            onClick={() => handleShare("whatsapp")}
          >
            💬 WhatsApp
          </button>
          <button
            className="btn btn-sm btn-light w-100 text-start mb-1"
            onClick={() => handleShare("twitter")}
          >
            🐦 Twitter
          </button>
          <button
            className="btn btn-sm btn-light w-100 text-start mb-1"
            onClick={() => handleShare("facebook")}
          >
            📘 Facebook
          </button>
          <button
            className="btn btn-sm btn-light w-100 text-start"
            onClick={() => handleShare("telegram")}
          >
            ✈️ Telegram
          </button>
        </div>
      )}
    </div>
  );
};
