import React from "react";
import Toolbar from "./editor/Toolbar";
import { TOOLBAR_PRESETS } from "./editor/toolbarPresets";

export default function ArticleEditorHeader({
  currentEditor,
  onAddFootnote,
  onSaveDraft,
  onPublish,
}) {
  return (
    <div className="editor-header">
      <div className="editor-header-left">
        <button className="btn-back">← Back</button>
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
          <button className="rounded-md border border-red-500 bg-white px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50">
            Batalkan
          </button>
          <button
            onClick={onSaveDraft}
            className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            Simpan Draf
          </button>
          <button
            onClick={onPublish}
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
          >
            Terbitkan
          </button>
        </div>
      </div>
    </div>
  );
}
