import React, { useState, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import {
  IconEdit,
  IconMessage,
  IconHistory,
  IconTrash,
} from "@tabler/icons-react";
import { API_BASE } from "../config";
import Toolbar from "./editor/Toolbar";
import {
  sharedExtensions,
  generateFootnoteId,
  applyGlobalFootnoteNumbers,
} from "./editor/editorExtension";
import { TOOLBAR_PRESETS, createToolbarConfig } from "./editor/toolbarPresets";
import "./ParagraphEditor.css";

export default function ParagraphEditor({
  paragraph,
  sectionId,
  canEdit,
  isEditMode,
  onUpdate,
  footnoteNumberMap,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(paragraph.content || "");
  const [footnotes, setFootnotes] = useState(paragraph.footnotes || []);
  const [showFootnoteModal, setShowFootnoteModal] = useState(false);
  const [footnoteText, setFootnoteText] = useState("");
  const [currentFootnoteId, setCurrentFootnoteId] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const token = localStorage.getItem("token");
  const [savedSelection, setSavedSelection] = useState(null);
  const [orderedFootnotes, setOrderedFootnotes] = useState([]);

  const editor = useEditor({
    extensions: sharedExtensions,
    content: content,
    editable: false,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
      applyGlobalFootnoteNumbers(editor, footnoteNumberMap);
    },
  });

  useEffect(() => {
    if (editor) editor.setEditable(isEditing);
  }, [editor, isEditing]);

  useEffect(() => {
    if (
      editor &&
      paragraph.content_json.content[0].content[0].text !== editor.getHTML()
    ) {
      editor.commands.setContent(
        paragraph.content_json.content[0].content[0].text,
      );
      setContent(paragraph.content_json.content[0].content[0].text);
    }
  }, [paragraph.content_json.content[0].content[0].text, editor]);

  useEffect(() => {
    if (paragraph.footnotes) {
      setFootnotes(paragraph.footnotes);
    }
  }, [paragraph.footnotes]);

  useEffect(() => {
    if (editor) {
      applyGlobalFootnoteNumbers(editor, footnoteNumberMap);
    }
  }, [editor, footnoteNumberMap]);

  useEffect(() => {
    if (footnoteNumberMap) {
      const ordered = footnotes
        .map((fn) => ({
          ...fn,
          number: footnoteNumberMap[fn.id],
        }))
        .filter((fn) => fn.number !== undefined)
        .sort((a, b) => a.number - b.number);
      setOrderedFootnotes(ordered);
    }
  }, [footnotes, footnoteNumberMap]);

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

  const handleAddFootnote = () => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    if (from === to) {
      alert("Pilih teks terlebih dahulu");
      return;
    }

    setSavedSelection({ from, to });
    setShowFootnoteModal(true);
    setFootnoteText("");
    setCurrentFootnoteId(null);
  };

  const handleFootnoteSubmit = () => {
    if (!footnoteText.trim()) {
      alert("Isi catatan kaki tidak boleh kosong");
      return;
    }

    if (!savedSelection) return;

    const footnoteId = generateFootnoteId();

    editor
      .chain()
      .focus()
      .setTextSelection(savedSelection)
      .setMark("footnote", { id: footnoteId })
      .run();

    const newFootnote = {
      id: footnoteId,
      content: footnoteText,
    };

    const updatedParagraph = {
      ...paragraph,
      footnotes: [...footnotes, newFootnote],
    };

    setFootnotes(updatedParagraph.footnotes);
    onUpdate?.(updatedParagraph);

    setShowFootnoteModal(false);
    setFootnoteText("");
    setCurrentFootnoteId(null);
    setSavedSelection(null);
  };

  const handleEditFootnote = (footnote) => {
    setCurrentFootnoteId(footnote.id);
    setFootnoteText(footnote.content);
    setShowFootnoteModal(true);
  };

  const handleFootnoteUpdate = () => {
    if (!footnoteText.trim()) {
      alert("Isi catatan kaki tidak boleh kosong");
      return;
    }

    const updatedFootnotes = footnotes.map((f) =>
      f.id === currentFootnoteId ? { ...f, content: footnoteText } : f,
    );

    const updatedParagraph = {
      ...paragraph,
      footnotes: updatedFootnotes,
    };

    setFootnotes(updatedFootnotes);
    onUpdate?.(updatedParagraph);

    setOrderedFootnotes(
      footnotes
        .map((fn) => ({
          ...fn,
          number: footnoteNumberMap?.[fn.id],
        }))
        .filter((fn) => fn.number)
        .sort((a, b) => a.number - b.number),
    );

    setShowFootnoteModal(false);
    setFootnoteText("");
    setCurrentFootnoteId(null);
  };

  const handleDeleteFootnote = (footnoteId) => {
    if (!editor) return;

    const { state } = editor;
    let tr = state.tr;
    let changed = false;

    state.doc.descendants((node, pos) => {
      if (!node.marks) return;

      node.marks.forEach((mark) => {
        if (mark.type.name === "footnote" && mark.attrs.id === footnoteId) {
          tr.removeMark(pos, pos + node.nodeSize, mark);
          changed = true;
        }
      });
    });

    if (changed) {
      editor.view.dispatch(tr);
    }

    const newFootnotes = footnotes.filter((f) => f.id !== footnoteId);

    const updatedParagraph = {
      ...paragraph,
      footnotes: newFootnotes,
    };

    setFootnotes(newFootnotes);
    onUpdate?.(updatedParagraph);
  };

  async function handleSave() {
    try {
      const resp = await fetch(
        `${API_BASE}/api/paragraphs/${paragraph.id}/expand/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ content, footnotes }),
        },
      );
      if (!resp.ok) throw new Error("Save failed");
      const data = await resp.json();
      setIsEditing(false);
      if (onUpdate) onUpdate(data);
    } catch (err) {
      alert("Gagal menyimpan paragraf");
    }
  }

  function handleCancel() {
    setIsEditing(false);
    if (editor) {
      editor.commands.setContent(
        paragraph.content_json.content[0].content[0].text,
      );
      setContent(paragraph.content_json.content[0].content[0].text);
    }
    setFootnotes(paragraph.footnotes || []);
  }

  return (
    <div
      className={`paragraph-wrapper mb-3 ${isEditMode && !isEditing ? "editable" : ""}`}
    >
      <div className="paragraph-content">
        {isEditing ? (
          <div className="editor-container">
            <Toolbar
              editor={editor}
              config={TOOLBAR_PRESETS.FULL}
              onAddFootnote={handleAddFootnote}
              isEditing={isEditing}
              onCancel={handleCancel}
              onPublish={handleSave}
              onSaveDraft={handleSave}
            />
            <div className="editor-content-wrapper">
              <div
                className="bg-yellow-50 border border-yellow-200 p-3 rounded text-yellow-800 flex items-start w-full"
                role="alert"
              >
                <div className="alert-icon mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon alert-icon icon-2"
                  >
                    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                </div>
                Tanggapan dimoderasi guna menolak spam, vandal, dan
                sampah-peradaban lainnya. Mohon maklum.
                <button
                  className="ml-auto text-yellow-700"
                  aria-label="close"
                  onClick={() => {}}
                >
                  &times;
                </button>
              </div>
              <EditorContent editor={editor} />
            </div>
            {orderedFootnotes.length > 0 && (
              <div
                className="footnotes-section editor-actions mt-2 d-flex gap-2 pt-3"
                style={{ borderTop: "2px solid #e5e7eb" }}
              >
                {orderedFootnotes.map((footnote) => (
                  <div
                    key={footnote.id}
                    className="footnote-item d-flex gap-2 mb-2 p-2"
                    style={{ backgroundColor: "#f9fafb", borderRadius: "4px" }}
                  >
                    <div style={{ fontWeight: 600, minWidth: "24px" }}>
                      [{footnote.number}]
                    </div>
                    <div className="flex-1">{footnote.content}</div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditFootnote(footnote)}
                        className="text-sm px-2 py-1 border border-gray-300 rounded text-gray-700"
                        style={{ fontSize: "12px" }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFootnote(footnote.id)}
                        className="text-sm px-2 py-1 border border-red-300 rounded text-red-600"
                        style={{ fontSize: "12px" }}
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div
              className="paragraph-text"
              dangerouslySetInnerHTML={{
                __html: paragraph.content_json.content[0].content[0].text,
              }}
            />
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
        )}
      </div>

      {isEditMode && canEdit && !isEditing && (
        <div className="paragraph-actions d-flex gap-2 mt-2 justify-content-end">
          <button
            className="btn btn-sm btn-link d-flex align-items-center gap-1"
            onClick={() => setShowHistoryModal(true)}
          >
            <IconHistory size={16} />
            <span>Riwayat</span>
          </button>
          <button
            className="btn btn-sm btn-link d-flex align-items-center gap-1"
            onClick={() => setIsEditing(true)}
          >
            <IconEdit size={16} />
            <span>Sunting</span>
          </button>
          <button
            className="btn btn-sm btn-link d-flex align-items-center gap-1"
            onClick={() => setShowCommentModal(true)}
          >
            <IconMessage size={16} />
            <span>Tanggapi</span>
          </button>
        </div>
      )}

      {showFootnoteModal && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {currentFootnoteId
                      ? "Edit Catatan Kaki"
                      : "Tambah Catatan Kaki"}
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => {
                      setShowFootnoteModal(false);
                      setFootnoteText("");
                      setCurrentFootnoteId(null);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <textarea
                    className="form-control"
                    rows={4}
                    value={footnoteText}
                    onChange={(e) => setFootnoteText(e.target.value)}
                    placeholder="Masukkan isi catatan kaki..."
                    autoFocus
                  />
                </div>
                <div className="modal-footer">
                  <button
                    className="px-3 py-1 border rounded text-gray-700"
                    onClick={() => {
                      setShowFootnoteModal(false);
                      setFootnoteText("");
                      setCurrentFootnoteId(null);
                    }}
                  >
                    Batal
                  </button>
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                    onClick={
                      currentFootnoteId
                        ? handleFootnoteUpdate
                        : handleFootnoteSubmit
                    }
                  >
                    {currentFootnoteId ? "Update" : "Tambah"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop show"
            onClick={() => {
              setShowFootnoteModal(false);
              setFootnoteText("");
              setCurrentFootnoteId(null);
            }}
          ></div>
        </>
      )}

      {showCommentModal && (
        <CommentModal
          paragraphId={paragraph.id}
          onClose={() => setShowCommentModal(false)}
        />
      )}
      {showHistoryModal && (
        <HistoryModal
          paragraphId={paragraph.id}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
}

function CommentModal({ paragraphId, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetchComments();
  }, []);

  async function fetchComments() {
    const resp = await fetch(
      `${API_BASE}/api/paragraphs/${paragraphId}/comments/`,
      { credentials: "include" },
    );
    if (resp.ok) {
      const data = await resp.json();
      setComments(data.results || data);
    }
  }

  async function handleSubmit() {
    if (!newComment.trim()) return;
    const resp = await fetch(
      `${API_BASE}/api/paragraphs/${paragraphId}/comments/`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      },
    );
    if (resp.ok) {
      setNewComment("");
      fetchComments();
    }
  }

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Tanggapan</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <textarea
                className="form-control"
                rows="3"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                className="btn btn-primary btn-sm mt-2"
                onClick={handleSubmit}
              >
                Kirim
              </button>
            </div>
            {comments.map((c) => (
              <div key={c.id} className="card mb-2">
                <div className="card-body">
                  <strong>{c.user?.username || "Anon"}</strong>
                  <p className="mb-0">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" onClick={onClose}></div>
    </div>
  );
}

function HistoryModal({ paragraphId, onClose }) {
  const [revisions, setRevisions] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchRevisions();
  }, []);

  async function fetchRevisions() {
    const resp = await fetch(
      `${API_BASE}/api/paragraphs/${paragraphId}/revisions/`,
      { credentials: "include" },
    );
    if (resp.ok) {
      const data = await resp.json();
      setRevisions(data.results || data);
    }
  }

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Riwayat</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="list-group">
              {revisions.map((r) => (
                <div
                  key={r.id}
                  className={`list-group-item ${selected?.id === r.id ? "active" : ""}`}
                  onClick={() => setSelected(r)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="d-flex justify-content-between">
                    <strong>{r.created_by?.username}</strong>
                    <small>{new Date(r.created_at).toLocaleString()}</small>
                  </div>
                  {selected?.id === r.id && (
                    <div
                      className="mt-2 p-2 bg-light text-dark rounded"
                      dangerouslySetInnerHTML={{ __html: r.content }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" onClick={onClose}></div>
    </div>
  );
}
