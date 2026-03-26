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
import "./SectionEditor.css";

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
    ws.onopen = () => {
      //console.log("Section WS open for", section.section_key);
    };
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
    ws.onclose = () =>
      console.log("Section WS closed for", section.section_key);
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
      <div
        className="d-flex gap-1 border-bottom py-1 mb-2 bg-white sticky-top"
        style={{ top: 0, zIndex: 10 }}
      >
        {[1, 2, 3, 4, 5, 6].map((L) => {
          const Icon = headingIcons[L];
          return (
            <button
              key={L}
              type="button"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: L }).run()
              }
              className={`btn btn-sm ${editor.isActive("heading", { level: L }) ? "btn-primary" : "btn-light"}`}
            >
              <Icon size={18} />
            </button>
          );
        })}

        {/* bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`btn btn-sm ${editor.isActive("bold") ? "btn-primary" : "btn-light"}`}
        >
          <IconBold size={18} />
        </button>

        {/* italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`btn btn-sm ${editor.isActive("italic") ? "btn-primary" : "btn-light"}`}
        >
          <IconItalic size={18} />
        </button>

        {/* underline */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`btn btn-sm ${editor.isActive("underline") ? "btn-primary" : "btn-light"}`}
        >
          <IconUnderline size={18} />
        </button>

        {/* strike */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`btn btn-sm ${editor.isActive("strike") ? "btn-primary" : "btn-light"}`}
        >
          <IconStrikethrough size={18} />
        </button>

        {/* bullet list */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`btn btn-sm ${editor.isActive("bulletList") ? "btn-primary" : "btn-light"}`}
        >
          <IconList size={18} />
        </button>

        {/* blockquote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`btn btn-sm ${editor.isActive("blockquote") ? "btn-primary" : "btn-light"}`}
        >
          <IconQuote size={18} />
        </button>

        {/* link */}
        <button
          type="button"
          className="btn btn-sm btn-light"
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
          className="btn btn-sm btn-light"
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <IconUnlink size={18} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2 className="h2 font-semibold p-0">
          {section.section_title ?? section.section_key}
        </h2>
        <div>
          {lockedBy && (
            <span className="text-danger small mr-2">
              🔒 editing by {lockedBy}
            </span>
          )}
          {!isEditing ? (
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={handleStartEdit}
              disabled={!canEdit}
            >
              Edit
            </button>
          ) : (
            <>
              <button
                className="btn btn-sm btn-success mr-2"
                onClick={handleSave}
              >
                Save
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
      <div className="section-editor card bg-transparent border-0 py-3">
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
