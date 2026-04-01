import React from "react";
import { useNavigate } from "react-router-dom";
import Toolbar from "./editor/Toolbar";
import { TOOLBAR_PRESETS } from "./editor/toolbarPresets";

/* ── Icon helpers ──────────────────────────────────────────── */
const IconArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);

const IconX = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const IconSave = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const IconSend = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

/* ────────────────────────────────────────────────────────── */

export default function ArticleEditorHeader({
  currentEditor,
  onAddFootnote,
  onSaveDraft,
  onPublish,
}) {
  const navigate = useNavigate();

  return (
    <div className="editor-header sticky top-0 z-30">
      {/* Left: Back */}
      <div className="editor-header-left">
        <button
          type="button"
          id="editor-back-btn"
          className="editor-back-btn"
          onClick={() => navigate(-1)}
          title="Kembali"
        >
          <IconArrowLeft />
          <span className="hidden sm:inline">Kembali</span>
        </button>
      </div>

      {/* Center: Toolbar */}
      {currentEditor && (
        <div className="editor-header-toolbar">
          <Toolbar
            editor={currentEditor}
            config={TOOLBAR_PRESETS.FULL}
            onAddFootnote={onAddFootnote}
          />
        </div>
      )}

      {/* Right: Actions */}
      <div className="editor-header-actions">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id="editor-btn-batalkan"
            className="editor-action-btn editor-action-cancel"
            title="Batalkan perubahan"
          >
            <IconX />
            <span className="hidden sm:inline">Batalkan</span>
          </button>

          <button
            type="button"
            id="editor-btn-simpan-draf"
            onClick={onSaveDraft}
            className="editor-action-btn editor-action-draft"
            title="Simpan sebagai draf"
          >
            <IconSave />
            <span className="hidden sm:inline">Simpan Draf</span>
          </button>

          <button
            type="button"
            id="editor-btn-terbitkan"
            onClick={onPublish}
            className="editor-action-btn editor-action-publish"
            title="Terbitkan artikel"
          >
            <IconSend />
            <span>Terbitkan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
