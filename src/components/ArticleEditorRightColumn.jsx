import React from "react";
import ImageUploadManager from "./ImageUploadManager";
import LocationManager from "./LocationManager";
import ResensiFields from "./ResensiFields";

export default function ArticleEditorRightColumn({
  articleType,
  collapsed,
  contentType,
  setContentType,
  bookTitle,
  setBookTitle,
  bookAuthor,
  setBookAuthor,
  bookPublisher,
  setBookPublisher,
  bookYear,
  setBookYear,
  category,
  setCategory,
  locationData,
  setLocationData,
  setImages,
  images,
  focusImageIndex,
  onFocusComplete,
}) {
  const isDiskursus = articleType === "DISKURSUS";

  return (
    <div
      className={`${collapsed ? "md:col-span-3 h-full pt-5" : "col h-full pt-5"} overflow-y-auto max-h-[calc(100vh-120px)]`}
    >
      {isDiskursus ? (
        <>
          <div className="mb-4">
            <h3 className="mb-4 text-xl font-semibold text-red-500">
              Tipe Konten
            </h3>
            <select
              className="border rounded px-2 py-1 w-full text-sm"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            >
              <option value="blog">Blog</option>
              <option value="resensi">Resensi</option>
            </select>
          </div>

          {contentType === "resensi" && (
            <ResensiFields
              bookTitle={bookTitle}
              setBookTitle={setBookTitle}
              bookAuthor={bookAuthor}
              setBookAuthor={setBookAuthor}
              bookPublisher={bookPublisher}
              setBookPublisher={setBookPublisher}
              bookYear={bookYear}
              setBookYear={setBookYear}
            />
          )}
        </>
      ) : (
        <>
          <div className="mb-4">
            <h3 className="mb-4 text-xl font-semibold text-red-500">
              Kategori
            </h3>
            <select
              className="border rounded px-2 py-1 w-full text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="agraria">Agraria</option>
              <option value="ekosospol">
                Ekonomi & Sosial Politik
              </option>
              <option value="sumber-daya-alam">Sumber Daya Alam</option>
            </select>
          </div>
          <LocationManager
            locationData={locationData}
            setLocationData={setLocationData}
          />
        </>
      )}
      <ImageUploadManager
        setImages={setImages}
        images={images}
        focusImageIndex={focusImageIndex}
        onFocusComplete={onFocusComplete}
      />
    </div>
  );
}
