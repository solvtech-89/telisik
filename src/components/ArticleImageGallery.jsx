import { useEffect, useState, useRef } from "react";
import { API_BASE } from "../config";

export default function ArticleImageGallery({
  slug,
  tipe,
  canEdit,
  contributors,
}) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [showContributors, setShowContributors] = useState(false);

  const isDiskursus = tipe === "diskursus";

  async function fetchImages() {
    try {
      const resp = await fetch(
        `${API_BASE}/api/articles/${tipe}/${slug}/images/`,
      );
      const data = await resp.json();

      // Handle error response for diskursus
      if (data.error) {
        console.log("Images endpoint returned error:", data.error);
        setImages([]);
        return;
      }

      setImages(data);
    } catch (err) {
      console.error("Failed to load images", err);
      setImages([]);
    }
  }

  useEffect(() => {
    fetchImages();
  }, [slug, tipe]);

  async function handleUpload(file) {
    if (!file) return;
    if (isDiskursus) {
      alert("Untuk diskursus, silakan unggah cover melalui form edit artikel");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const resp = await fetch(
        `${API_BASE}/api/articles/${tipe}/${slug}/upload_image/`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      if (!resp.ok) {
        const data = await resp.json();
        if (data.error) {
          alert(data.error);
          return;
        }
        throw new Error("Upload failed");
      }

      await fetchImages();
    } catch (err) {
      console.error("Upload failed", err);
      alert("Gagal mengunggah gambar");
    } finally {
      setUploading(false);
    }
  }

  async function setFeatured(imageId) {
    if (isDiskursus) return; // No featured image for diskursus

    try {
      await fetch(
        `${API_BASE}/api/articles/${tipe}/${slug}/set_featured_image/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ image_id: imageId }),
        },
      );
      fetchImages();
    } catch (err) {
      console.error("Set featured failed", err);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    if (isDiskursus) return;
    const file = e.dataTransfer.files[0];
    handleUpload(file);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowContributors(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleShare(platform) {
    const url = window.location.href;
    const text = "Check out this article";

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(text + " " + url)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
  }

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="avatar-list avatar-list-stacked mr-3">
            {contributors &&
              contributors.map((s) => (
                <span
                  key={s.id}
                  className="avatar avatar-sm"
                  style={{
                    backgroundImage: `url(${s.avatar_url.startsWith("/static/") ? `${API_BASE}${s.avatar_url}` : s.avatar_url})`,
                  }}
                ></span>
              ))}
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center text-blue-600 p-0 text-sm hover:underline"
              onClick={() => setShowContributors(!showContributors)}
              style={{ fontSize: "0.95rem" }}
            >
              Kontributor
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-1"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {showContributors && contributors && (
              <div
                className="absolute bg-white border rounded shadow-sm mt-1 py-2"
                style={{
                  minWidth: "200px",
                  zIndex: 1000,
                  left: 0,
                }}
              >
                {contributors.map((contributor) => (
                  <a
                    key={contributor.id}
                    href={`/contribution/${contributor.username}`}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100"
                    style={{ transition: "background-color 0.2s" }}
                  >
                    <span
                      className="avatar avatar-xs rounded-full"
                      style={{
                        backgroundImage: `url(${contributor.avatar_url.startsWith("/static/") ? `${API_BASE}${contributor.avatar_url}` : contributor.avatar_url})`,
                        width: "24px",
                        height: "24px",
                      }}
                    ></span>
                    <span style={{ fontSize: "0.875rem" }}>
                      {contributor.username}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500" style={{ fontSize: "0.9rem" }}>
            Sebarkan
          </span>
          <button
            className="p-1 text-gray-600 hover:text-gray-800"
            onClick={() => handleShare("facebook")}
            title="Share on Facebook"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="#1877F2"
              stroke="none"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>
          <button
            className="p-1 text-gray-600 hover:text-gray-800"
            onClick={() => handleShare("twitter")}
            title="Share on X (Twitter)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>
          <button
            className="p-1 text-gray-600 hover:text-gray-800"
            onClick={() => handleShare("whatsapp")}
            title="Share on WhatsApp"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="#25D366"
              stroke="none"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
          </button>
          <button
            className="p-1 text-gray-600 hover:text-gray-800"
            onClick={() => handleShare("telegram")}
            title="Share on Telegram"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="#0088cc"
              stroke="none"
            >
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
          </button>
          <button
            className="p-1 text-gray-600 hover:text-gray-800"
            onClick={() => handleShare("linkedin")}
            title="Share on LinkedIn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="#0A66C2"
              stroke="none"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </button>
          <button
            className="p-1 text-gray-600 hover:text-gray-800"
            onClick={() => handleShare("threads")}
            title="Share on Threads"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M16.7831 11.2634C16.6962 11.2217 16.608 11.1817 16.5186 11.1433C16.3629 8.27512 14.7957 6.63309 12.1642 6.61628C12.1522 6.61621 12.1404 6.61621 12.1285 6.61621C10.5545 6.61621 9.24537 7.28807 8.43964 8.51066L9.88691 9.50346C10.4888 8.59023 11.4335 8.39555 12.1292 8.39555C12.1372 8.39555 12.1453 8.39555 12.1532 8.39562C13.0197 8.40115 13.6735 8.65307 14.0967 9.14436C14.4047 9.50204 14.6106 9.9963 14.7126 10.6201C13.9444 10.4895 13.1136 10.4494 12.2254 10.5003C9.72345 10.6444 8.11499 12.1036 8.22302 14.1312C8.27784 15.1597 8.79022 16.0445 9.66571 16.6225C10.4059 17.1111 11.3593 17.3501 12.3501 17.296C13.6586 17.2243 14.6851 16.725 15.4012 15.8122C15.9451 15.1189 16.2891 14.2206 16.441 13.0886C17.0646 13.465 17.5267 13.9602 17.782 14.5555C18.216 15.5676 18.2413 17.2306 16.8843 18.5864C15.6954 19.7741 14.2663 20.2879 12.1066 20.3038C9.71079 20.286 7.8989 19.5177 6.72086 18.0201C5.61773 16.6178 5.04762 14.5923 5.02635 11.9998C5.04762 9.40735 5.61773 7.38184 6.72086 5.97953C7.8989 4.48197 9.71076 3.71365 12.1065 3.69584C14.5197 3.71378 16.3631 4.4858 17.5863 5.99059C18.186 6.72852 18.6382 7.65653 18.9363 8.73854L20.6323 8.28604C20.271 6.9542 19.7024 5.80654 18.9287 4.85475C17.3607 2.92554 15.0673 1.937 12.1124 1.9165H12.1006C9.15173 1.93693 6.88409 2.92923 5.36069 4.86581C4.00506 6.58912 3.3058 8.98699 3.2823 11.9927L3.28223 11.9998L3.2823 12.0069C3.3058 15.0127 4.00506 17.4106 5.36069 19.1339C6.88409 21.0704 9.15173 22.0628 12.1006 22.0832H12.1124C14.7342 22.065 16.5821 21.3786 18.1045 19.8576C20.0963 17.8677 20.0363 15.3734 19.3798 13.8423C18.9089 12.7442 18.0109 11.8524 16.7831 11.2634ZM12.2564 15.5192C11.1599 15.581 10.0207 15.0888 9.96449 14.0346C9.92286 13.2529 10.5208 12.3807 12.3237 12.2768C12.5302 12.2649 12.7328 12.2591 12.9319 12.2591C13.5868 12.2591 14.1994 12.3227 14.7564 12.4444C14.5487 15.039 13.3301 15.4603 12.2564 15.5192Z"
                fill="#555333"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Only show image gallery if there are images OR if user can edit (for articles) */}
      {(images.length > 0 || (canEdit && !isDiskursus)) && (
        <>
          <div
            className="flex gap-3 overflow-auto p-2 border rounded-none"
            style={{ whiteSpace: "nowrap" }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {images.map((img) => (
              <div
                key={img.id}
                className="position-relative"
                style={{ flex: "0 0 auto" }}
              >
                <img
                  src={
                    img.file || img.url
                      ? (img.file || img.url).startsWith("/static/")
                        ? `${API_BASE}${img.file || img.url}`
                        : img.file || img.url
                      : ""
                  }
                  alt={img.caption || ""}
                  className="rounded-none shadow-sm"
                  style={{
                    height: 160,
                    width: "auto",
                    border: img.featured
                      ? "3px solid #10b981"
                      : "1px solid #ddd",
                  }}
                />
                {canEdit && !isDiskursus && (
                  <div
                    className="absolute left-0 right-0 bottom-0 text-center bg-black bg-opacity-50 text-white text-sm py-1"
                    style={{ cursor: "pointer" }}
                    onClick={() => setFeatured(img.id)}
                  >
                    {img.featured ? "⭐ Featured" : "Set Featured"}
                  </div>
                )}
              </div>
            ))}

            {canEdit && !isDiskursus && (
              <div
                onClick={() => fileInputRef.current.click()}
                className="flex justify-center items-center border rounded text-gray-500"
                style={{
                  width: 160,
                  height: 160,
                  cursor: "pointer",
                  flex: "0 0 auto",
                }}
              >
                + Add
              </div>
            )}
          </div>

          {canEdit && !isDiskursus && (
            <button
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2 p-1"
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-cloud-upload"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-1" />
                <path d="M9 15l3 -3l3 3" />
                <path d="M12 12l0 9" />
              </svg>{" "}
              {uploading ? "Uploading..." : "Unggah foto/video terkait"}
            </button>
          )}
        </>
      )}

      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={(e) => handleUpload(e.target.files[0])}
      />
    </div>
  );
}
