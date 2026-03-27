import React from "react";
import ParagraphEditor from "./ParagraphEditor";

export default function TimelineEntryEditor({
  entry,
  sectionId,
  articleSlug,
  tipe,
  canEdit,
  isEditMode,
  onUpdate,
  isFirst,
  isLast,
  footnoteNumberMap,
}) {
  const paragraphs = entry.paragraphs || [];

  return (
    <div className="relative">
      <div className="relative flex gap-6 md:gap-4">
        {/* Timeline dot and line */}
        <div className="relative flex shrink-0 flex-col items-center">
          <div
            className={`z-[2] ${isFirst ? "flex h-6 w-6 items-center justify-center" : "h-4 w-4 rounded-full border-[3px] border-white bg-red-600 shadow-[0_0_0_2px_#dc3545]"} ${isLast ? "border-[3px] border-red-600 bg-transparent shadow-none" : ""}`}
          >
            {isFirst && (
              <svg
                className="block"
                width="18"
                height="16"
                viewBox="0 0 18 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 16L0.339746 1L17.6603 1L9 16Z"
                  stroke="#dc3545"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            )}
          </div>
          {!isLast && (
            <div className="mt-1 min-h-[60px] w-0.5 flex-1 bg-gray-300"></div>
          )}
        </div>

        {/* Entry content */}
        <div className="flex-1 pb-4">
          {/* Date and time header */}
          <div className="mb-2 flex items-center gap-4">
            <div className="flex items-center text-sm text-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span className="font-medium text-red-600">
                {entry.formatted_datetime}
              </span>
            </div>
          </div>

          {/* Entry title */}
          <h3 className="mb-3 text-[1.1rem] font-bold">{entry.title}</h3>

          {/* Action buttons (only in edit mode) */}
          {canEdit && isEditMode && (
            <div className="mb-3 flex flex-wrap justify-end gap-3 md:flex-col">
              <button className="admin-content-action-btn admin-content-action-history inline-flex items-center gap-2 rounded-md bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 md:w-full md:justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Riwayat
              </button>
              <button className="admin-content-action-btn admin-content-action-edit inline-flex items-center gap-2 rounded-md bg-fuchsia-100 px-4 py-2 text-sm font-medium text-fuchsia-700 hover:bg-fuchsia-200 md:w-full md:justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Sunting
              </button>
              <button className="admin-content-action-btn admin-content-action-comment inline-flex items-center gap-2 rounded-md bg-green-100 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-200 md:w-full md:justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 11 12 14 22 4"></polyline>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                Tanggapi
              </button>
            </div>
          )}

          {/* Paragraphs */}
          <div className="mt-4">
            {paragraphs.length === 0 && (
              <p className="italic text-gray-500">
                Belum ada konten untuk entri ini
              </p>
            )}

            {paragraphs
              .filter((p) => !p.is_deleted)
              .sort((a, b) => a.order - b.order)
              .map((paragraph, index) => (
                <ParagraphEditor
                  key={paragraph.id}
                  paragraph={paragraph}
                  sectionId={entry.id}
                  articleSlug={articleSlug}
                  tipe={tipe}
                  canEdit={canEdit}
                  isEditMode={isEditMode}
                  onUpdate={onUpdate}
                  footnoteNumberMap={footnoteNumberMap}
                />
              ))}
          </div>

          {/* Peristiwa Persetujuan button (only in edit mode) */}
          {canEdit && isEditMode && (
            <div className="mt-3">
              <button className="rounded-md border-2 border-dashed border-red-400 bg-transparent px-5 py-2 text-sm font-medium text-red-400 transition-colors hover:border-red-500 hover:bg-red-50 hover:text-red-500">
                + Fragmen Peristiwa
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
