import React, { useState } from "react";
import ParagraphEditor from "./ParagraphEditor";
import "./TimelineEntryEditor.css";

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
  const [paragraphs, setParagraphs] = useState(entry.paragraphs || []);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="timeline-entry-wrapper">
      <div className="timeline-entry">
        {/* Timeline dot and line */}
        <div className="timeline-marker">
          <div
            className={`timeline-dot ${isFirst ? "timeline-dot-first" : ""} ${isLast ? "timeline-dot-last" : ""}`}
          >
            {isFirst && (
              <svg
                className="triangle-icon"
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
          {!isLast && <div className="timeline-line"></div>}
        </div>

        {/* Entry content */}
        <div className="timeline-content">
          {/* Date and time header */}
          <div className="timeline-header mb-2">
            <div className="timeline-datetime">
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
              <span className="text-danger font-medium">
                {entry.formatted_datetime}
              </span>
            </div>
          </div>

          {/* Entry title */}
          <h3 className="timeline-title fw-bold mb-3">{entry.title}</h3>

          {/* Action buttons (only in edit mode) */}
          {canEdit && isEditMode && (
            <div className="timeline-actions mb-3">
              <button className="btn-action btn-riwayat">
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
              <button className="btn-action btn-sunting">
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
              <button className="btn-action btn-tanggapi">
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
          <div className="timeline-paragraphs">
            {paragraphs.length === 0 && (
              <p className="text-muted fst-italic">
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
              <button className="btn-fragmen-peristiwa">
                + Fragmen Peristiwa
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
