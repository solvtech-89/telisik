import React, { useState } from "react";
import RichTextRenderer from "./RichTextRenderer";
import "./TimelineParagraphEditor.css";

export default function TimelineParagraphEditor({
  paragraph,
  entryId,
  articleSlug,
  tipe,
  canEdit,
  isEditMode,
  onUpdate,
  showActions
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="timeline-paragraph-wrapper mb-3">
      <div className="timeline-paragraph">
        <RichTextRenderer content={paragraph.content_json} />
      </div>

      {/* Action buttons - only show on last paragraph in edit mode */}
      {canEdit && isEditMode && showActions && (
        <div className="paragraph-actions mt-2">
          <button className="btn-action-small btn-riwayat-small">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Riwayat
          </button>
          <button className="btn-action-small btn-sunting-small">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Sunting
          </button>
          <button className="btn-action-small btn-tanggapi-small">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            Tanggapi
          </button>
        </div>
      )}
    </div>
  );
}