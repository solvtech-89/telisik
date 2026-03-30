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
      className={`editor-right-rail col-span-1 ${
        collapsed ? "md:col-span-4" : "md:col-span-3"
      } lg:col-span-1 lg:col-start-3 h-full min-h-0 overflow-y-scroll border-l border-[#dfddd4] bg-[#f7f5ef] px-4 pt-5`}
    >
      {isDiskursus ? (
        <>
          <div className="mb-4">
            <h3 className="mb-4 text-xl font-semibold text-red-500">
              Tipe Konten
            </h3>
            <select
              className="editor-side-select h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-[#0088ff] focus:outline-none focus:ring-2 focus:ring-[#0088ff]/15"
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
              className="editor-side-select h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-[#0088ff] focus:outline-none focus:ring-2 focus:ring-[#0088ff]/15"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="agraria">Agraria</option>
              <option value="ekosospol">Ekonomi & Sosial Politik</option>
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
