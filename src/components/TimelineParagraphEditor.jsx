import React from "react";
import RichTextRenderer from "./RichTextRenderer";

export default function TimelineParagraphEditor({
  paragraph,
  entryId,
  articleSlug,
  tipe,
  canEdit,
  isEditMode,
  onUpdate,
  showActions,
}) {
  return (
    <div className="relative mb-3">
      <div className="rounded bg-gray-50 p-4 leading-relaxed border-l-[3px] border-l-gray-300 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_h1]:my-2 [&_h2]:my-2 [&_h3]:my-2 [&_h4]:my-2 [&_h5]:my-2 [&_h6]:my-2 [&_ul]:mb-2 [&_ul]:ml-6 [&_ol]:mb-2 [&_ol]:ml-6 [&_blockquote]:italic [&_blockquote]:text-gray-500 [&_code]:text-sm">
        <RichTextRenderer content={paragraph.content_json} />
      </div>

      {/* Action buttons - only show on last paragraph in edit mode */}
      {canEdit && isEditMode && showActions && (
        <div className="mt-2 ml-4 flex flex-wrap gap-2">
          <button className="admin-content-action-btn admin-content-action-history inline-flex min-w-[100px] flex-1 items-center justify-center gap-1.5 rounded bg-blue-100 px-3 py-1.5 text-[0.8rem] font-medium text-blue-700 hover:bg-blue-200 md:flex-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
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
          <button className="admin-content-action-btn admin-content-action-edit inline-flex min-w-[100px] flex-1 items-center justify-center gap-1.5 rounded bg-fuchsia-100 px-3 py-1.5 text-[0.8rem] font-medium text-fuchsia-700 hover:bg-fuchsia-200 md:flex-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
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
          <button className="admin-content-action-btn admin-content-action-comment inline-flex min-w-[100px] flex-1 items-center justify-center gap-1.5 rounded bg-green-100 px-3 py-1.5 text-[0.8rem] font-medium text-green-700 hover:bg-green-200 md:flex-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
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
    </div>
  );
}
