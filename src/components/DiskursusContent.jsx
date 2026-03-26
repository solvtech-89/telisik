import React, { useState, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { IconEdit, IconMessage, IconHistory } from "@tabler/icons-react";
import { API_BASE } from "../config";
import Toolbar from "./editor/Toolbar";
import {
  sharedExtensions,
  generateFootnoteId,
  applyGlobalFootnoteNumbers,
} from "./editor/editorExtension";
import { buildFootnoteMapFromHTML } from "../utils/footnotes";
import { TOOLBAR_PRESETS, createToolbarConfig } from "./editor/toolbarPresets";
import "./DiskursusContent.css";

// Extensions for tanggapan (response) editor - no footnotes
const tanggapanExtensions = sharedExtensions.filter(
  (ext) => ext.name !== "footnote",
);

function CommentModal({ articleSlug, tipe, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetchComments();
  }, []);

  async function fetchComments() {
    try {
      const resp = await fetch(
        `${API_BASE}/api/articles/${tipe}/${articleSlug}/comments/`,
        {
          credentials: "include",
        },
      );
      if (resp.ok) {
        const data = await resp.json();
        setComments(data.results || data);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  }

  async function handleSubmit() {
    if (!newComment.trim()) return;
    const token = localStorage.getItem("token");
    try {
      const resp = await fetch(
        `${API_BASE}/api/articles/${tipe}/${articleSlug}/comments/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ content: newComment }),
        },
      );
      if (resp.ok) {
        setNewComment("");
        fetchComments();
      }
    } catch (err) {
      console.error("Failed to submit comment:", err);
      alert("Gagal mengirim tanggapan");
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg w-full max-w-md mx-4 max-h-[80vh] overflow-auto">
        <div className="p-4 border-b flex items-center">
          <h5 className="modal-title">Tanggapan</h5>
          <button className="ml-auto text-gray-600" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="p-4">
          <div className="mb-3">
            <textarea
              className="w-full border rounded p-2"
              rows="3"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tulis tanggapan Anda..."
            />
            <button
              className="bg-blue-600 text-white text-sm rounded px-3 py-1 mt-2"
              onClick={handleSubmit}
            >
              Kirim
            </button>
          </div>
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center">Belum ada tanggapan</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="mb-2 bg-white shadow rounded p-3">
                <div className="flex justify-between mb-2">
                  <strong>{c.user?.username || "Anon"}</strong>
                  <small className="text-gray-500">
                    {new Date(c.created_at).toLocaleString()}
                  </small>
                </div>
                <p className="mb-0">{c.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="fixed inset-0 bg-black/40" onClick={onClose}></div>
    </div>
  );
}

function HistoryModal({ articleSlug, tipe, onClose }) {
  const [revisions, setRevisions] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchRevisions();
  }, []);

  async function fetchRevisions() {
    try {
      const resp = await fetch(
        `${API_BASE}/api/articles/${tipe}/${articleSlug}/revisions/`,
        {
          credentials: "include",
        },
      );
      if (resp.ok) {
        const data = await resp.json();
        setRevisions(data.results || data);
      }
    } catch (err) {
      console.error("Failed to fetch revisions:", err);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg w-full max-w-3xl mx-4 max-h-[80vh] overflow-auto">
        <div className="p-4 border-b flex items-center">
          <h5 className="modal-title">Riwayat Perubahan</h5>
          <button className="ml-auto text-gray-600" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="p-4">
          {revisions.length === 0 ? (
            <p className="text-gray-500 text-center">
              Belum ada riwayat perubahan
            </p>
          ) : (
            <div className="space-y-2">
              {revisions.map((r) => (
                <div
                  key={r.id}
                  className={`p-2 border rounded ${selected?.id === r.id ? "bg-gray-50" : ""}`}
                  onClick={() => setSelected(r)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="flex justify-between">
                    <strong>{r.created_by?.username}</strong>
                    <small>{new Date(r.created_at).toLocaleString()}</small>
                  </div>
                  {selected?.id === r.id && (
                    <div
                      className="mt-2 p-2 bg-white text-gray-800 rounded"
                      dangerouslySetInnerHTML={{ __html: r.content }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="fixed inset-0 bg-black/40" onClick={onClose}></div>
    </div>
  );
}

export default function DiskursusContent({
  content,
  canEdit,
  isEditMode,
  articleSlug,
  tipe,
}) {
  const [showFootnoteModal, setShowFootnoteModal] = useState(false);
  const [footnoteText, setFootnoteText] = useState("");
  const [savedSelection, setSavedSelection] = useState(null);
  const [footnotes, setFootnotes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState(content || "");
  const [tanggapanContent, setTanggapanContent] = useState("");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const token = localStorage.getItem("token");
  const [footnoteMap, setFootnoteMap] = useState({});

  const editor = useEditor({
    extensions: sharedExtensions,
    content: editorContent,
    editable: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setEditorContent(html);
      setFootnoteMap(buildFootnoteMapFromHTML(html));
    },
  });

  const tanggapan = useEditor({
    extensions: tanggapanExtensions,
    content: tanggapanContent,
    editable: true,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setTanggapanContent(html);
    },
  });

  const handleAddFootnote = () => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    if (from === to) {
      alert("Pilih teks terlebih dahulu");
      return;
    }

    setSavedSelection({ from, to });
    setShowFootnoteModal(true);
  };

  const handleFootnoteSubmit = () => {
    if (!footnoteText.trim()) {
      alert("Isi catatan kaki tidak boleh kosong");
      return;
    }
    if (!savedSelection || !editor) return;

    const id = generateFootnoteId();

    editor
      .chain()
      .focus()
      .setTextSelection(savedSelection)
      .setMark("footnote", { id })
      .run();

    setFootnotes((prev) => [...prev, { id, content: footnoteText }]);

    setShowFootnoteModal(false);
    setFootnoteText("");
    setSavedSelection(null);
  };

  useEffect(() => {
    if (editor) editor.setEditable(isEditing);
  }, [editor, isEditing]);

  useEffect(() => {
    if (editor) {
      applyGlobalFootnoteNumbers(editor, footnoteMap);
    }
  }, [footnoteMap, editor]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
      setEditorContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (!editor) return;
    const handlePaste = (event) => {
      const htmlData = event.clipboardData.getData("text/html");
      if (htmlData && htmlData.includes("MsoNormal")) {
        event.preventDefault();
        const textData = event.clipboardData.getData("text/plain");
        editor.commands.insertContent(textData);
      }
    };
    const dom = editor.view.dom;
    dom.addEventListener("paste", handlePaste);
    return () => dom.removeEventListener("paste", handlePaste);
  }, [editor]);

  async function handleSave() {
    try {
      const resp = await fetch(
        `${API_BASE}/api/articles/${tipe}/${articleSlug}/`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ content: editorContent, footnotes }),
        },
      );
      if (!resp.ok) throw new Error("Save failed");
      const data = await resp.json();
      setIsEditing(false);
      alert("Konten berhasil disimpan!");
      // Optionally update parent component
      if (window.location) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Gagal menyimpan konten");
    }
  }

  function handleCancel() {
    setIsEditing(false);
    if (editor) {
      editor.commands.setContent(content);
      setEditorContent(content);
    }
  }

  // Get ordered footnotes for display
  const orderedFootnotes = footnotes
    .map((fn) => ({
      ...fn,
      number: footnoteMap[fn.id],
    }))
    .filter((fn) => fn.number !== undefined)
    .sort((a, b) => a.number - b.number);

  return (
    <div
      className={`diskursus-content-wrapper ${isEditMode && !isEditing ? "editable" : ""}`}
    >
      <div className="diskursus-content">
        {isEditing ? (
          <div className="editor-container">
            <Toolbar
              editor={editor}
              config={TOOLBAR_PRESETS.FULL}
              onAddFootnote={handleAddFootnote}
              isEditing={isEditing}
              onCancel={handleCancel}
              onSaveDraft={handleSave}
              onPublish={handleSave}
            />
            <div className="editor-content-wrapper">
              <EditorContent editor={editor} />
            </div>
            {orderedFootnotes.length > 0 && (
              <div
                className="footnotes-section mt-3 pt-3"
                style={{ borderTop: "1px solid #dee2e6" }}
              >
                <h6
                  className="mb-2"
                  style={{ fontSize: "14px", color: "#6c757d" }}
                >
                  Catatan Kaki
                </h6>
                {orderedFootnotes.map((footnote) => (
                  <div
                    key={footnote.id}
                    className="footnote-item mb-1"
                    style={{ fontSize: "14px" }}
                  >
                    <span style={{ fontWeight: 600 }}>[{footnote.number}]</span>{" "}
                    {footnote.content}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="content-display">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        )}
      </div>

      {isEditMode && canEdit && !isEditing && (
        <div className="content-actions flex gap-2 mt-3 justify-end">
          <button
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
            onClick={() => setShowHistoryModal(true)}
          >
            <IconHistory size={16} />
            <span>Riwayat</span>
          </button>
          <button
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
            onClick={() => setIsEditing(true)}
          >
            <IconEdit size={16} />
            <span>Sunting</span>
          </button>
          <button
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
            onClick={() => setShowCommentModal(true)}
          >
            <IconMessage size={16} />
            <span>Tanggapi</span>
          </button>
        </div>
      )}

      <div className="boxtanggapi mt-5 mb-5">
        <h2 className="text-orange-600">Tanggapi</h2>
        <div className="tanggapan-container">
          <Toolbar editor={tanggapan} config={TOOLBAR_PRESETS.COMMENT} />
          <div className="tanggapan-content-wrapper">
            <EditorContent editor={tanggapan} />
          </div>
        </div>
        <p className="small mt-2 mb-0">
          <em>
            Tanggapan dimoderasi guna menolak spam, vandal, dan sampah-peradaban
            lainnya. Mohon maklum.
          </em>
        </p>
      </div>

      {showCommentModal && (
        <CommentModal
          articleSlug={articleSlug}
          tipe={tipe}
          onClose={() => setShowCommentModal(false)}
        />
      )}

      {showHistoryModal && (
        <HistoryModal
          articleSlug={articleSlug}
          tipe={tipe}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

      {showFootnoteModal && (
        <>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg w-full max-w-lg mx-4">
              <div className="p-4 border-b flex items-center">
                <h5 className="modal-title">Tambah Catatan Kaki</h5>
                <button
                  className="ml-auto text-gray-600"
                  onClick={() => {
                    setShowFootnoteModal(false);
                    setFootnoteText("");
                    setSavedSelection(null);
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <textarea
                  className="w-full border rounded p-2"
                  rows={4}
                  value={footnoteText}
                  onChange={(e) => setFootnoteText(e.target.value)}
                  placeholder="Masukkan isi catatan kaki..."
                  autoFocus
                />
              </div>
              <div className="p-4 flex justify-end gap-2 border-t">
                <button
                  className="bg-gray-200 text-gray-800 px-3 py-1 rounded"
                  onClick={() => {
                    setShowFootnoteModal(false);
                    setFootnoteText("");
                    setSavedSelection(null);
                  }}
                >
                  Batal
                </button>
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={handleFootnoteSubmit}
                >
                  Tambah
                </button>
              </div>
            </div>
            <div
              className="fixed inset-0 bg-black/40"
              onClick={() => {
                setShowFootnoteModal(false);
                setFootnoteText("");
                setSavedSelection(null);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
