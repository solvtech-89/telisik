import React from "react";
import ImageUploadManager from "./ImageUploadManager";
import LocationManager from "./LocationManager";
import ResensiFields from "./ResensiFields";

/* ── Wrapper card dengan full-bleed header ─────────────────
   Konsisten dengan tampilan sidebar pada artikel published.
   Props:
     title   — label header card (string)
     id      — html id untuk card
     children — konten card
─────────────────────────────────────────────────────────── */
function SideCard({ title, id, children }) {
  return (
    <div id={id} className="editor-side-card">
      {/* Full-bleed header strip */}
      {title && (
        <h3 className="editor-side-title" title={title}>
          {title}
        </h3>
      )}
      {/* Card body */}
      <div className="px-3 py-2.5">{children}</div>
    </div>
  );
}

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
      } lg:col-span-1 lg:col-start-3 h-full min-h-0 overflow-y-scroll border-l border-[#dfddd4] bg-[#F9F6EF] px-3 pt-3`}
    >
      {isDiskursus ? (
        <>
          {/* ── Tipe Konten ─────────────────────────── */}
          <SideCard title="Tipe Konten" id="side-card-content-type">
            <select
              id="editor-content-type-select"
              className="editor-side-select h-9 w-full rounded-md border border-gray-300 bg-[#F9F6EF] px-3 text-sm text-gray-700 focus:border-[#ef5f2f] focus:outline-none focus:ring-2 focus:ring-[#ef5f2f]/10"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            >
              <option value="blog">Blog</option>
              <option value="resensi">Resensi</option>
            </select>
          </SideCard>

          {contentType === "resensi" && (
            <SideCard title="Data Buku" id="side-card-book-data">
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
            </SideCard>
          )}
        </>
      ) : (
        <>
          {/* ── Kategori ────────────────────────────── */}
          <SideCard title="Kategori" id="side-card-category">
            <select
              id="editor-category-select"
              className="editor-side-select h-9 w-full rounded-md border border-gray-300 bg-[#F9F6EF] px-3 text-sm text-gray-700 focus:border-[#ef5f2f] focus:outline-none focus:ring-2 focus:ring-[#ef5f2f]/10"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="agraria">Agraria</option>
              <option value="ekosospol">Ekonomi &amp; Sosial Politik</option>
              <option value="sumber-daya-alam">Sumber Daya Alam</option>
            </select>
          </SideCard>

          {/* ── Lokasi ──────────────────────────────── */}
          <div className="editor-side-card editor-location-card">
            <h3 className="editor-side-title">Lokasi</h3>
            <div className="px-3 py-2.5">
              <LocationManager
                locationData={locationData}
                setLocationData={setLocationData}
              />
            </div>
          </div>
        </>
      )}

      {/* ── Foto / Gambar ────────────────────────────── */}
      <div className="editor-side-card editor-image-card">
        <h3 className="editor-side-title">Foto &amp; Gambar</h3>
        <div className="px-3 py-2.5">
          <ImageUploadManager
            setImages={setImages}
            images={images}
            focusImageIndex={focusImageIndex}
            onFocusComplete={onFocusComplete}
          />
        </div>
      </div>
    </div>
  );
}
