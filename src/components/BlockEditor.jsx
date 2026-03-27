import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";

import StarterKit from "@tiptap/starter-kit";

import { API_BASE, WS_BASE } from "../config";

export default function BlockEditor({ blockId, articleSlug, canEdit }) {
  const [baseRevisionId, setBaseRevisionId] = useState(null);
  const [lockedBy, setLockedBy] = useState(null);
  const [contentJSON, setContentJSON] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const wsRef = useRef(null);
  const heartbeatRef = useRef(null);

  // --- TipTap editor ---
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
    ],
    content: "",
    editable: isEditing && canEdit,
    onUpdate: ({ editor }) => setContentJSON(editor.getJSON()),
    onBlur: () => {
      if (canEdit && isEditing) {
        saveBlock();
        setIsEditing(false);
      }
    },
  });

  useEffect(() => {
    if (editor) editor.setEditable(isEditing && canEdit);
  }, [editor, isEditing, canEdit]);

  // --- Fetch block ---
  async function fetchBlock() {
    try {
      const resp = await fetch(`${API_BASE}/api/blocks/${blockId}/`);
      const data = await resp.json();
      setBaseRevisionId(data.last_revision_id);
      setContentJSON(data.content_json);
      if (editor && data.content_json)
        editor.commands.setContent(data.content_json);
    } catch (err) {
      console.error("fetchBlock error", err);
    }
  }

  // --- Save ---
  async function saveBlock() {
    if (!editor) return;
    const content_json = editor.getJSON();
    try {
      const resp = await fetch(`${API_BASE}/api/blocks/${blockId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_revision_id: baseRevisionId,
          content_json,
        }),
      });

      if (resp.status === 409) {
        const data = await resp.json();
        editor.commands.setContent(data.latest);
        alert("Your edit conflicted with another user and was reset.");
        return;
      }

      const data = await resp.json();
      setBaseRevisionId(data.last_revision_id);
    } catch (err) {
      console.error("saveBlock error", err);
    }
  }

  // --- WebSocket lock handling ---
  function connectWS() {
    const ws = new WebSocket(`${WS_BASE}/ws/article/${articleSlug}/`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({ type: "lock_request", block_id: String(blockId) }),
      );
      heartbeatRef.current = setInterval(() => {
        ws.send(
          JSON.stringify({ type: "heartbeat_lock", block_id: String(blockId) }),
        );
      }, 60_000);
    };

    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.block_id !== String(blockId)) return;
      if (msg.type === "block_updated") fetchBlock();
      if (msg.type === "block_locked") setLockedBy(msg.locked_by);
      if (msg.type === "block_unlocked") setLockedBy(null);
    };

    ws.onclose = () => {
      clearInterval(heartbeatRef.current);
      wsRef.current = null;
    };
  }

  useEffect(() => {
    fetchBlock();
    connectWS();
    return () => {
      wsRef.current?.close();
      clearInterval(heartbeatRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Helper: extract text for static view ---
  function extractText(node) {
    if (!node) return "";
    if (Array.isArray(node)) return node.map(extractText).join("");
    if (node.type === "text") return node.text || "";
    if (node.content) return extractText(node.content);
    return "";
  }

  if (!contentJSON) return null;

  let node = contentJSON;
  if (
    node?.type === "doc" &&
    Array.isArray(node.content) &&
    node.content.length > 0
  )
    node = node.content[0];
  const textContent = extractText(node);

  // --- STATIC VIEW (not editable) ---
  if (!canEdit) {
    if (node.type === "heading") {
      const level = node.attrs?.level || 2;
      const Tag = `h${level}`;
      return <Tag className="mb-2">{textContent}</Tag>;
    }
    if (node.type === "paragraph") return <p className="mb-3">{textContent}</p>;
    return (
      <div className="border bg-gray-50 p-0 text-gray-500">
        [Unsupported block type: {node.type}]
      </div>
    );
  }

  // --- EDITABLE view ---
  return (
    <div className="p-0 [&_.ProseMirror]:min-h-6 [&_.ProseMirror]:whitespace-pre-wrap [&_.ProseMirror]:break-words [&_.ProseMirror]:leading-relaxed [&_.ProseMirror]:outline-none [&_.ProseMirror_p]:my-2 [&_.ProseMirror_h1]:my-2 [&_.ProseMirror_h2]:my-2 [&_.ProseMirror_h3]:my-2 [&_.ProseMirror_h4]:my-2 [&_.ProseMirror_h5]:my-2">
      {lockedBy && (
        <div className="mb-1 text-sm text-red-600">
          🔒 editing by {lockedBy}
        </div>
      )}

      {!isEditing ? (
        <div
          onClick={() => setIsEditing(true)}
          className="cursor-pointer text-gray-900"
        >
          {node.type === "heading" ? (
            (() => {
              const lvl = Math.min(Math.max(node.attrs?.level || 2, 1), 6);
              const Tag = `h${lvl}`;
              return <Tag>{textContent}</Tag>;
            })()
          ) : (
            <p>{textContent}</p>
          )}
        </div>
      ) : (
        <>
          {editor && (
            <BubbleMenu
              editor={editor}
              className="z-[200] flex gap-1.5 rounded-lg border border-gray-300 bg-white/95 p-1 shadow-lg [&_button]:cursor-pointer [&_button]:rounded-md [&_button]:bg-transparent [&_button]:px-2 [&_button]:py-1 [&_button]:hover:bg-gray-100 [&_button.active]:bg-blue-600 [&_button.active]:text-white"
            >
              {(() => {
                const nodeName = editor.state.selection.$from.parent.type.name;

                if (nodeName === "heading") {
                  // Heading toolbar
                  return [1, 2, 3, 4, 5, 6].map((L) => (
                    <button
                      key={L}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() =>
                        editor.chain().focus().toggleHeading({ level: L }).run()
                      }
                      className={
                        editor.isActive("heading", { level: L }) ? "active" : ""
                      }
                    >
                      H{L}
                    </button>
                  ));
                }

                // Paragraph / Rich text toolbar
                return (
                  <>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      className={editor.isActive("bold") ? "active" : ""}
                    >
                      <b>B</b>
                    </button>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() =>
                        editor.chain().focus().toggleItalic().run()
                      }
                      className={editor.isActive("italic") ? "active" : ""}
                    >
                      <i>I</i>
                    </button>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                      }
                      className={editor.isActive("underline") ? "active" : ""}
                    >
                      <u>U</u>
                    </button>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() =>
                        editor.chain().focus().toggleStrike().run()
                      }
                      className={editor.isActive("strike") ? "active" : ""}
                    >
                      <s>S</s>
                    </button>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                      }
                      className={editor.isActive("bulletList") ? "active" : ""}
                    >
                      • List
                    </button>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                      }
                      className={editor.isActive("blockquote") ? "active" : ""}
                    >
                      ❝
                    </button>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        const url = prompt("Enter link URL");
                        if (url)
                          editor.chain().focus().setLink({ href: url }).run();
                      }}
                      className={editor.isActive("link") ? "active" : ""}
                    >
                      🔗
                    </button>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => editor.chain().focus().unsetLink().run()}
                    >
                      ❌
                    </button>
                  </>
                );
              })()}
            </BubbleMenu>
          )}

          <EditorContent editor={editor} />
        </>
      )}
    </div>
  );
}
