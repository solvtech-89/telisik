import React from "react";
import { useNavigate } from "react-router-dom";
import Toolbar from "./editor/Toolbar";
import { TOOLBAR_PRESETS } from "./editor/toolbarPresets";

export default function ArticleEditorHeader({
  currentEditor,
  onAddFootnote,
  onSaveDraft,
  onPublish,
}) {
  const navigate = useNavigate();

  return (
    <div className="editor-header sticky top-0 z-30">
      <div className="editor-header-left">
        <button
          type="button"
          className="editor-back-btn rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>

      {currentEditor && (
        <div className="editor-header-toolbar">
          <Toolbar
            editor={currentEditor}
            config={TOOLBAR_PRESETS.FULL}
            onAddFootnote={onAddFootnote}
          />
        </div>
      )}

      <div className="editor-header-actions">
        <div className="flex items-center gap-2">
          <button className="editor-action-btn editor-action-cancel rounded-md border border-red-500 bg-white px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50">
            Batalkan
          </button>
          <button
            onClick={onSaveDraft}
            className="editor-action-btn editor-action-draft rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            Simpan Draf
          </button>
          <button
            onClick={onPublish}
            className="editor-action-btn editor-action-publish rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
          >
            Terbitkan
          </button>
        </div>
      </div>
    </div>
  );
}
