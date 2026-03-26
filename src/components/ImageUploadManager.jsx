import React, { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";

function ImageUploadManager({
  setImages,
  images,
  focusImageIndex,
  onFocusComplete,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [highlightMissing, setHighlightMissing] = useState();
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];

    files.forEach((file) => {
      if (file.size > 1.5 * 1024 * 1024) {
        alert(`File ${file.name} melebihi 1.5 MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        newImages.push({
          id: Date.now() + Math.random(),
          file: file,
          preview: event.target.result,
          name: file.name,
          sumber: "",
          keterangan: "",
          teksAlternatif: "",
        });

        if (newImages.length === files.length) {
          const updatedImages = [...images, ...newImages];
          setImages(updatedImages);
          if (images.length === 0) {
            setCurrentIndex(0);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const handleDeleteCurrent = () => {
    if (window.confirm("Hapus gambar ini?")) {
      const newImages = images.filter((_, i) => i !== currentIndex);
      setImages(newImages);
      if (currentIndex >= newImages.length && newImages.length > 0) {
        setCurrentIndex(newImages.length - 1);
      } else if (newImages.length === 0) {
        setCurrentIndex(0);
      }
    }
  };

  const handleSetAsMain = (index) => {
    const reordered = [...images];
    const [mainImage] = reordered.splice(index, 1);
    reordered.unshift(mainImage);
    setImages(reordered);
    if (onImagesChange) {
      onImagesChange(reordered);
    }
    setCurrentIndex(0);
  };

  const updateCurrentImage = (field, value) => {
    setImages((prev) =>
      prev.map((img, i) =>
        i === currentIndex ? { ...img, [field]: value } : img,
      ),
    );

    // Remove highlight when user starts typing in sumber field
    if (field === "sumber" && value.trim()) {
      setHighlightMissing(false);
      setShowAlert(false);
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAlert(false);
      setHighlightMissing(false);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAlert(false);
      setHighlightMissing(false);
    }
  };

  const currentImage = images[currentIndex];

  useEffect(() => {
    if (focusImageIndex) {
      setCurrentIndex(focusImageIndex);
    }
  });

  return (
    <div>
      <h3
        style={{
          fontSize: "20px",
          fontWeight: "600",
          color: "#ef4444",
          marginBottom: "16px",
        }}
      >
        Gambar{" "}
        {images.length > 0 && (
          <span className="inline-flex items-center bg-red-600 text-white text-xs rounded-full px-2 py-0.5 ml-2">
            {images.length}
          </span>
        )}
      </h3>

      {images.length === 0 ? (
        // Upload Area - Only shown when no images
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: "2px dashed #e5e7eb",
            borderRadius: "8px",
            padding: "32px",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s",
            backgroundColor: "#fafafa",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#3b82f6";
            e.currentTarget.style.backgroundColor = "#eff6ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.backgroundColor = "#fafafa";
          }}
        >
          <Upload size={32} color="#9ca3af" style={{ marginBottom: "8px" }} />
          <div
            style={{ fontSize: "14px", color: "#6b7280", fontWeight: "500" }}
          >
            Unggah gambar (wajib)
          </div>
          <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
            Rasio 3:2 atau 960 × 640 pixels
            <br />
            Maksimal 1.5 MB per gambar
          </div>
        </div>
      ) : (
        // Image Editor View
        <div>
          {/* Alert for missing source */}
          {showAlert && !currentImage?.sumber && (
            <div
              className="p-3 rounded border border-red-200 bg-red-50 text-red-800 flex justify-between items-start"
              role="alert"
            >
              <div className="flex items-start gap-3">
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
                  className="mt-0.5"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div>
                  <div className="font-semibold">
                    Sumber gambar wajib diisi!
                  </div>
                  <div className="text-sm text-gray-600">
                    Harap isi sumber gambar sebelum melanjutkan.
                  </div>
                </div>
              </div>
              <button
                className="ml-4 text-gray-500 hover:text-gray-700"
                onClick={() => setShowAlert(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          )}

          {/* Image Navigation Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
              padding: "8px 12px",
              backgroundColor: "#f8f9fa",
              borderRadius: "6px",
            }}
          >
            <div
              style={{ fontSize: "13px", fontWeight: "600", color: "#495057" }}
            >
              Gambar {currentIndex + 1} dari {images.length}
              {currentIndex === 0 && (
                <span
                  style={{
                    marginLeft: "8px",
                    fontSize: "10px",
                    fontWeight: "600",
                    color: "#d97706",
                    backgroundColor: "#fef3c7",
                    padding: "2px 6px",
                    borderRadius: "3px",
                  }}
                >
                  UTAMA
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                style={{
                  padding: "4px 8px",
                  border: "1px solid #dee2e6",
                  borderRadius: "4px",
                  backgroundColor: currentIndex === 0 ? "#e9ecef" : "white",
                  cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                  opacity: currentIndex === 0 ? 0.5 : 1,
                }}
                title="Gambar sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={goToNext}
                disabled={currentIndex === images.length - 1}
                style={{
                  padding: "4px 8px",
                  border: "1px solid #dee2e6",
                  borderRadius: "4px",
                  backgroundColor:
                    currentIndex === images.length - 1 ? "#e9ecef" : "white",
                  cursor:
                    currentIndex === images.length - 1
                      ? "not-allowed"
                      : "pointer",
                  opacity: currentIndex === images.length - 1 ? 0.5 : 1,
                }}
                title="Gambar berikutnya"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Image Preview */}
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "3/2",
              borderRadius: "8px",
              overflow: "hidden",
              border: "2px solid #e5e7eb",
              marginBottom: "16px",
              backgroundColor: "#f8f9fa",
            }}
          >
            <img
              src={currentImage?.preview}
              alt={currentImage?.teksAlternatif || currentImage?.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

            {/* Image Actions Overlay */}
            <div
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                display: "flex",
                gap: "6px",
              }}
            >
              {currentIndex !== 0 && (
                <button
                  onClick={() => handleSetAsMain(currentIndex)}
                  style={{
                    padding: "6px 10px",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#495057",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                  title="Jadikan gambar utama"
                >
                  <ImageIcon size={12} />
                  <span>Jadikan Utama</span>
                </button>
              )}
              <button
                onClick={handleDeleteCurrent}
                style={{
                  padding: "6px 10px",
                  backgroundColor: "rgba(239, 68, 68, 0.95)",
                  border: "1px solid #dc2626",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
                title="Hapus gambar"
              >
                <X size={12} />
                <span>Hapus</span>
              </button>
            </div>
          </div>

          {/* Filename */}
          <div
            style={{
              fontSize: "12px",
              color: "#6b7280",
              marginBottom: "16px",
              fontStyle: "italic",
            }}
          >
            {currentImage?.name}
          </div>

          {/* Form Fields */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "6px",
                display: "block",
              }}
            >
              Sumber <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              className={`w-full border rounded px-3 py-2 text-sm ${(showAlert || highlightMissing) && !currentImage?.sumber ? "border-red-500 ring-2 ring-red-200" : "border-gray-300"} `}
              placeholder="Contoh: Foto oleh John Doe / Unsplash"
              value={currentImage?.sumber || ""}
              onChange={(e) => updateCurrentImage("sumber", e.target.value)}
              autoFocus={highlightMissing && !currentImage?.sumber}
            />
            <div
              style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}
            >
              Wajib diisi untuk gambar {currentIndex + 1}
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              className="form-label"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "6px",
                display: "block",
              }}
            >
              Keterangan (Caption)
            </label>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm"
              rows={3}
              maxLength={155}
              placeholder="Tulis keterangan gambar, maksimal 155 karakter"
              value={currentImage?.keterangan || ""}
              onChange={(e) => updateCurrentImage("keterangan", e.target.value)}
              style={{ fontSize: "13px", resize: "vertical" }}
            />
            <div
              style={{
                fontSize: "11px",
                color:
                  currentImage?.keterangan?.length > 140
                    ? "#ef4444"
                    : "#6b7280",
                marginTop: "4px",
                textAlign: "right",
              }}
            >
              {currentImage?.keterangan?.length || 0}/155
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              className="form-label"
              style={{
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "6px",
                display: "block",
              }}
            >
              Teks Alternatif (Alt Text)
            </label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Deskripsi singkat untuk aksesibilitas"
              value={currentImage?.teksAlternatif || ""}
              onChange={(e) =>
                updateCurrentImage("teksAlternatif", e.target.value)
              }
              style={{ fontSize: "13px" }}
            />
            <div
              style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}
            >
              Opsional. Membantu pembaca yang menggunakan screen reader.
            </div>
          </div>

          {/* Add More Images Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px dashed #3b82f6",
              borderRadius: "6px",
              backgroundColor: "#eff6ff",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500",
              color: "#3b82f6",
              marginTop: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Upload size={14} />
            Tambah Gambar Lainnya
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: "none" }}
        multiple
      />

      {/* Quick Navigation Dots */}
      {images.length > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "6px",
            marginTop: "16px",
            padding: "12px",
            backgroundColor: "#f8f9fa",
            borderRadius: "6px",
          }}
        >
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setShowAlert(false);
                setHighlightMissing(false);
              }}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                border: "none",
                backgroundColor:
                  index === currentIndex
                    ? "#3b82f6"
                    : !images[index].sumber
                      ? "#ef4444"
                      : "#cbd5e1",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.2s",
              }}
              title={`Gambar ${index + 1}${!images[index].sumber ? " (belum ada sumber)" : ""}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageUploadManager;
