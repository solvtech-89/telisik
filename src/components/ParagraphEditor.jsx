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
import { TOOLBAR_PRESETS } from "./editor/toolbarPresets";
import sanitizeHtml from "../utils/sanitizeHtml";

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
      className={`mb-3 rounded transition-all ${isEditMode && !isEditing ? "hover:bg-gray-50/60 dark:hover:bg-gray-700/30" : ""} [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:p-5 [&_.ProseMirror]:text-base [&_.ProseMirror]:leading-[1.7] [&_.ProseMirror]:outline-none [&_.ProseMirror]:text-gray-900 [&_.ProseMirror_p]:mb-2 [&_.ProseMirror_p:last-child]:mb-0 [&_.ProseMirror_h1]:mb-3 [&_.ProseMirror_h1]:mt-6 [&_.ProseMirror_h1]:text-[2rem] [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h2]:mt-6 [&_.ProseMirror_h2]:text-[1.75rem] [&_.ProseMirror_h3]:mb-3 [&_.ProseMirror_h3]:mt-6 [&_.ProseMirror_h3]:text-[1.5rem] [&_.ProseMirror_h4]:mb-3 [&_.ProseMirror_h4]:mt-6 [&_.ProseMirror_h4]:text-[1.25rem] [&_.ProseMirror_ul]:mb-3 [&_.ProseMirror_ul]:ml-6 [&_.ProseMirror_ol]:mb-3 [&_.ProseMirror_ol]:ml-6 [&_.ProseMirror_blockquote]:my-4 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-l-blue-600 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:border [&_.ProseMirror_code]:border-gray-200 [&_.ProseMirror_code]:bg-gray-50 [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_a]:text-blue-600 [&_.ProseMirror_a]:underline`}
    >
      <div>
        {isEditing ? (
          <div className="overflow-hidden rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-[#1a1d21]">
            <Toolbar
              editor={editor}
              config={TOOLBAR_PRESETS.FULL}
              onAddFootnote={handleAddFootnote}
              isEditing={isEditing}
              onCancel={handleCancel}
              onPublish={handleSave}
              onSaveDraft={handleSave}
            />
            <div className="max-h-[70vh] overflow-y-auto border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-[#1a1d21]">
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
              <div className="mt-2 flex flex-col gap-2 border-t-2 border-gray-200 bg-gray-50 p-3">
                {orderedFootnotes.map((footnote) => (
                  <div
                    key={footnote.id}
                    className="mb-2 flex gap-2 rounded bg-gray-50 p-2 last:mb-0"
                  >
                    <div className="min-w-6 font-semibold">
                      [{footnote.number}]
                    </div>
                    <div className="flex-1">{footnote.content}</div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditFootnote(footnote)}
                        className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFootnote(footnote.id)}
                        className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
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
              className="leading-[1.8] text-[#333] [&_p]:mb-2 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{
                __html: paragraph.content_json.content[0].content[0].text,
              }}
            />
            {orderedFootnotes.length > 0 && (
              <div className="mt-3 border-t border-gray-200 pt-3">
                <h6 className="mb-2 text-sm text-gray-500">Catatan Kaki</h6>
                {orderedFootnotes.map((footnote) => (
                  <div key={footnote.id} className="mb-1 text-sm">
                    <span className="font-semibold">[{footnote.number}]</span>{" "}
                    {footnote.content}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isEditMode && !isEditing && (
        <div
          className="mt-1.5 flex items-center justify-end gap-3 border-t pt-1.5"
          style={{ borderTopColor: "#e8e4d9" }}
        >
          <button
            className="inline-flex items-center gap-1 text-[0.78rem] text-[#8a876e] transition-colors hover:text-[#ef5f2f]"
            onClick={() => setShowHistoryModal(true)}
            title="Lihat riwayat suntingan"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
            </svg>
            <span>Riwayat</span>
          </button>

          <button
            className="inline-flex items-center gap-1 text-[0.78rem] text-[#8a876e] transition-colors hover:text-[#ef5f2f]"
            onClick={() => setIsEditing(true)}
            title="Sunting paragraf ini"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Sunting</span>
          </button>

          <button
            className="inline-flex items-center gap-1 text-[0.78rem] text-[#8a876e] transition-colors hover:text-[#ef5f2f]"
            onClick={() => setShowCommentModal(true)}
            title="Tambah tanggapan pada paragraf ini"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Tanggapi</span>
          </button>
        </div>
      )}

      {showFootnoteModal && (
        <>
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            tabIndex="-1"
          >
            <div className="w-full max-w-lg rounded-md bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h5 className="text-lg font-semibold text-gray-800">
                  {currentFootnoteId
                    ? "Edit Catatan Kaki"
                    : "Tambah Catatan Kaki"}
                </h5>
                <button
                  className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  onClick={() => {
                    setShowFootnoteModal(false);
                    setFootnoteText("");
                    setCurrentFootnoteId(null);
                  }}
                  aria-label="Tutup"
                >
                  ×
                </button>
              </div>
              <div className="px-4 py-3">
                <textarea
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  rows={4}
                  value={footnoteText}
                  onChange={(e) => setFootnoteText(e.target.value)}
                  placeholder="Masukkan isi catatan kaki..."
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-4 py-3">
                <button
                  className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setShowFootnoteModal(false);
                    setFootnoteText("");
                    setCurrentFootnoteId(null);
                  }}
                >
                  Batal
                </button>
                <button
                  className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
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
          <div
            className="fixed inset-0 z-40 bg-black/40"
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
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        tabIndex="-1"
      >
        <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-md bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h5 className="text-lg font-semibold">Tanggapan</h5>
            <button
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              onClick={onClose}
              aria-label="Tutup"
            >
              ×
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto px-4 py-3">
            <div className="mb-3">
              <textarea
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                rows="3"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                className="mt-2 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                onClick={handleSubmit}
              >
                Kirim
              </button>
            </div>
            {comments.map((c) => (
              <div
                key={c.id}
                className="mb-2 rounded border border-gray-200 bg-white p-3"
              >
                <strong className="text-sm">
                  {c.user?.username || "Anon"}
                </strong>
                <p className="mb-0 text-sm text-gray-700">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose}></div>
    </>
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
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        tabIndex="-1"
      >
        <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-md bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h5 className="text-lg font-semibold">Riwayat</h5>
            <button
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              onClick={onClose}
              aria-label="Tutup"
            >
              ×
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto px-4 py-3">
            <div className="space-y-2">
              {revisions.map((r) => (
                <div
                  key={r.id}
                  className={`cursor-pointer rounded border p-3 transition-colors ${selected?.id === r.id ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}
                  onClick={() => setSelected(r)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <strong>{r.created_by?.username}</strong>
                    <small className="text-gray-500">
                      {new Date(r.created_at).toLocaleString()}
                    </small>
                  </div>
                  {selected?.id === r.id && (
                    <div
                      className="mt-2 rounded bg-gray-100 p-2 text-gray-800"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(r.content),
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose}></div>
    </>
  );
}
