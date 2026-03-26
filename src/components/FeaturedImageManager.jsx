import { useState } from "react";
import { API_BASE } from "../config";
import ArticleList from "../pages/ArticleList";
import ImageUploader from "./ImageUploader";
import HeaderBar from "../components/HeaderBar";
import LeftNav from "../components/LeftNav";

function AlertBox({ type = "info", message, onClose }) {
  if (!message) return null;
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    danger: "bg-red-50 border-red-200 text-red-800",
  };

  return (
    <div
      className={`p-3 rounded border ${styles[type] || styles.info} flex justify-between items-start`}
      role="alert"
    >
      <div className="text-sm">{message}</div>
      <button
        type="button"
        className="ml-4 text-gray-500 hover:text-gray-700"
        aria-label="Close"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}

export default function FeaturedImageManager() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [message, setMessage] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [collapsed, setCollapsed] = useState(false);

  async function setFeaturedImage(articleSlug, imageId) {
    try {
      const resp = await fetch(
        `${API_BASE}/api/articles/${articleSlug}/set_featured_image/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ image_id: imageId }),
        },
      );
      if (!resp.ok) throw new Error("Failed to set featured image");
      setMessage("✅ Featured image updated!");
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }
  }

  function AlertBoxInner() {
    return (
      <div className="px-4 mt-2">
        <AlertBox
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: "", message: "" })}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <HeaderBar
        title="Featured Images"
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      {alert.message && <AlertBoxInner />}

      <div className="max-w-6xl mx-auto mt-4 px-4 w-full">
        <h4 className="text-lg font-semibold">Manage Featured Images</h4>

        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-2 rounded mt-2">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="md:col-span-2">
            <h6 className="font-medium mb-2">Articles</h6>
            <ArticleList onSelect={setSelectedArticle} />
          </div>

          <div className="md:col-span-1">
            <h6 className="font-medium mb-2">Upload New Image</h6>
            <ImageUploader onUploaded={setUploadedImage} />

            {selectedArticle && uploadedImage && (
              <button
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() =>
                  setFeaturedImage(selectedArticle.slug, uploadedImage.id)
                }
              >
                Set as Featured for “{selectedArticle.title}”
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
