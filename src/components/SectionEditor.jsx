// src/components/SectionEditor.jsx
import React, { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconList,
  IconQuote,
  IconLink,
  IconUnlink,
  IconH1,
  IconH2,
  IconH3,
  IconH4,
  IconH5,
  IconH6,
} from "@tabler/icons-react";

import { API_BASE, WS_BASE } from "../config";

export default function SectionEditor({
  section,
  articleSlug,
  canEdit,
  currentUser,
}) {
  // section: object from ArticlePage.sections list
  const [isEditing, setIsEditing] = useState(false);
  const [lockedBy, setLockedBy] = useState(null);
  const [baseRevisionId, setBaseRevisionId] = useState(
    section.last_revision_id || null,
  );
  const [contentJSON, setContentJSON] = useState(
    section.content_json || { type: "doc", content: [] },
  );
  const wsRef = useRef(null);
  const hbRef = useRef(null);

  const headingIcons = {
    1: IconH1,
    2: IconH2,
    3: IconH3,
    4: IconH4,
    5: IconH5,
    6: IconH6,
  };

  const editor = useEditor({
    extensions: [StarterKit],
    content: contentJSON,
    editable: isEditing && canEdit,
    onUpdate: ({ editor }) => setContentJSON(editor.getJSON()),
  });

  useEffect(() => {
    if (editor) editor.setEditable(isEditing && canEdit);
  }, [editor, isEditing, canEdit]);

  useEffect(() => {
    setContentJSON(section.content_json || { type: "doc", content: [] });
    setBaseRevisionId(section.last_revision_id || null);
    if (editor && section.content_json)
      editor.commands.setContent(section.content_json);
  }, [section, editor]);

  function ensureWS() {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;
    const ws = new WebSocket(`${WS_BASE}/ws/article/${articleSlug}/`);
    ws.onopen = () => {};
    ws.onmessage = (ev) => {
      try {
        const wrapper = JSON.parse(ev.data);
        const msg = wrapper.event ?? wrapper;
        if (!msg || !msg.type) return;
        if (msg.section_id && msg.section_id !== String(section.id)) return;

        if (msg.type === "section_locked") setLockedBy(msg.locked_by);
        if (msg.type === "section_unlocked") setLockedBy(null);
        if (msg.type === "section_updated") {
          fetchSectionLatest();
        }
      } catch (e) {
        console.error("ws parse", e);
      }
    };
    ws.onclose = () => {};
    wsRef.current = ws;
  }

  async function lockSection() {
    if (!canEdit) return;
    try {
      const resp = await fetch(`${API_BASE}/api/sections/${section.id}/lock/`, {
        method: "POST",
        credentials: "include",
      });
      if (!resp.ok) {
        if (resp.status === 409) {
          const data = await resp.json();
          setLockedBy(data.locked_by || "someone");
          alert("Section already locked by " + (data.locked_by || "someone"));
        } else {
          throw new Error("Failed to lock");
        }
        return false;
      }
      const data = await resp.json();
      setLockedBy(data.locked_by);
      // start heartbeat
      ensureWS();
      hbRef.current = setInterval(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "heartbeat_lock",
              section_id: String(section.id),
            }),
          );
        }
      }, 20_000);
      return true;
    } catch (err) {
      console.error("lockSection", err);
      return false;
    }
  }

  async function unlockSection() {
    try {
      const resp = await fetch(`${API_BASE}/api/sections/${section.id}/lock/`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!resp.ok) {
        console.warn("unlock returned not ok", resp.status);
      }
    } catch (err) {
      console.error("unlockSection", err);
    } finally {
      setLockedBy(null);
      if (hbRef.current) {
        clearInterval(hbRef.current);
        hbRef.current = null;
      }
    }
  }

  async function fetchSectionLatest() {
    try {
      const resp = await fetch(`${API_BASE}/api/sections/${section.id}/`);
      if (!resp.ok) throw new Error("fetch section failed");
      const data = await resp.json();
      setContentJSON(data.content_json);
      setBaseRevisionId(
        data.last_revision_id || data.revisions?.[0]?.id || null,
      );
      if (editor && data.content_json)
        editor.commands.setContent(data.content_json);
    } catch (err) {
      console.error("fetchSectionLatest", err);
    }
  }

  async function handleStartEdit() {
    if (!canEdit) return;
    const ok = await lockSection();
    if (!ok) return;
    setIsEditing(true);
    if (editor && contentJSON) editor.commands.setContent(contentJSON);
  }

  async function handleCancelEdit() {
    setIsEditing(false);
    await unlockSection();
    if (editor) {
      editor.commands.setContent(
        section.content_json || { type: "doc", content: [] },
      );
    }
  }

  async function handleSave() {
    if (!editor) return;
    const newDoc = editor.getJSON();
    try {
      const resp = await fetch(`${API_BASE}/api/sections/${section.id}/`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_revision_id: baseRevisionId,
          content_json: newDoc,
        }),
      });

      if (resp.status === 409) {
        const data = await resp.json();
        alert(
          "Conflict detected. Your changes were not saved. Reloading server version.",
        );
        if (data.latest) {
          editor.commands.setContent(data.latest);
          setBaseRevisionId(data.revision_id || null);
        } else {
          await fetchSectionLatest();
        }
        return;
      }

      if (!resp.ok) throw new Error("Save failed");
      const data = await resp.json();
      setBaseRevisionId(
        data.last_revision_id || data.revisions?.[0]?.id || null,
      );
      setIsEditing(false);
      await unlockSection();
    } catch (err) {
      console.error("handleSave", err);
      alert("Save failed");
    }
  }

  useEffect(() => {
    return () => {
      try {
        if (hbRef.current) clearInterval(hbRef.current);
      } catch (e) {}
      try {
        // attempt to unlock on unmount to release server-side locks
        // do not await; best-effort
        unlockSection();
      } catch (e) {}
      try {
        wsRef.current?.close();
      } catch (e) {}
    };
  }, []);

  // render helpers
  function renderStaticView() {
    // show the first few nodes as preview
    if (!section.content_json || !section.content_json.content) return null;
    const nodes = section.content_json.content;
    return nodes.map((n, idx) => {
      if (n.type === "heading") {
        const lvl = n.attrs?.level || 3;
        const Tag = `h${lvl}`;
        const text = n.content?.map((t) => t.text).join("") || "";
        return (
          <Tag key={idx} className="mb-2">
            {text}
          </Tag>
        );
      }
      if (n.type === "paragraph") {
        const text = n.content?.map((t) => t.text).join("") || "";
        return (
          <p key={idx} className="mb-2">
            {text}
          </p>
        );
      }
      return null;
    });
  }

  function Toolbar({ editor }) {
    if (!editor) return null;

    return (
      <div className="sticky top-0 z-10 mb-2 flex gap-1 border-b border-gray-200 bg-white py-1">
        {[1, 2, 3, 4, 5, 6].map((L) => {
          const Icon = headingIcons[L];
          return (
            <button
              key={L}
              type="button"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: L }).run()
              }
              className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-gray-700 transition-colors ${editor.isActive("heading", { level: L }) ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300 bg-white hover:bg-gray-50"}`}
            >
              <Icon size={18} />
            </button>
          );
        })}

        {/* bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-gray-700 transition-colors ${editor.isActive("bold") ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300 bg-white hover:bg-gray-50"}`}
        >
          <IconBold size={18} />
        </button>

        {/* italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-gray-700 transition-colors ${editor.isActive("italic") ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300 bg-white hover:bg-gray-50"}`}
        >
          <IconItalic size={18} />
        </button>

        {/* underline */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-gray-700 transition-colors ${editor.isActive("underline") ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300 bg-white hover:bg-gray-50"}`}
        >
          <IconUnderline size={18} />
        </button>

        {/* strike */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-gray-700 transition-colors ${editor.isActive("strike") ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300 bg-white hover:bg-gray-50"}`}
        >
          <IconStrikethrough size={18} />
        </button>

        {/* bullet list */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-gray-700 transition-colors ${editor.isActive("bulletList") ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300 bg-white hover:bg-gray-50"}`}
        >
          <IconList size={18} />
        </button>

        {/* blockquote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-gray-700 transition-colors ${editor.isActive("blockquote") ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300 bg-white hover:bg-gray-50"}`}
        >
          <IconQuote size={18} />
        </button>

        {/* link */}
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50"
          onClick={() => {
            const url = prompt("URL?");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          <IconLink size={18} />
        </button>

        {/* unlink */}
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50"
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <IconUnlink size={18} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="m-0 text-2xl font-semibold">
          {section.section_title ?? section.section_key}
        </h2>
        <div className="flex items-center gap-2">
          {lockedBy && (
            <span className="mr-2 text-xs text-red-500">
              🔒 editing by {lockedBy}
            </span>
          )}
          {!isEditing ? (
            <button
              className="rounded-md border border-blue-500 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleStartEdit}
              disabled={!canEdit}
            >
              Edit
            </button>
          ) : (
            <>
              <button
                className="rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-600"
                onClick={handleSave}
              >
                Save
              </button>
              <button
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
      <div className="card border-0 bg-transparent py-3 [&_.ProseMirror]:min-h-40 [&_.ProseMirror]:rounded-md [&_.ProseMirror]:border [&_.ProseMirror]:border-gray-200 [&_.ProseMirror]:bg-transparent [&_.ProseMirror]:p-3 [&_.bubble-menu]:flex [&_.bubble-menu]:gap-1.5 [&_.bubble-menu]:rounded-md [&_.bubble-menu]:border [&_.bubble-menu]:border-gray-200 [&_.bubble-menu]:bg-white/95 [&_.bubble-menu]:p-1.5">
        <div>
          {!isEditing && renderStaticView()}

          {isEditing && (
            <div>
              <>
                {isEditing && <Toolbar editor={editor} />}
                <EditorContent editor={editor} />
              </>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
