import React, { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import { sharedExtensions } from "./editor/editorExtension";
import sanitizeHtml from "../utils/sanitizeHtml";

function applyFootnoteNumbers(editor, footnoteNumberMap) {
  if (!editor || !footnoteNumberMap) return;

  const { state } = editor;
  let tr = state.tr;
  let hasChanges = false;

  state.doc.descendants((node, pos) => {
    if (!node.marks) return;

    node.marks.forEach((mark) => {
      if (mark.type.name !== "footnote") return;

      const globalNumber = footnoteNumberMap[mark.attrs.id];
      if (!globalNumber || mark.attrs.number === globalNumber) return;

      const newMark = state.schema.marks.footnote.create({
        ...mark.attrs,
        number: globalNumber,
      });

      tr.removeMark(pos, pos + node.nodeSize, mark);
      tr.addMark(pos, pos + node.nodeSize, newMark);
      hasChanges = true;
    });
  });

  if (hasChanges) {
    editor.view.dispatch(tr);
  }
}

export default function DiskursusContentEditor({
  content,
  onUpdate,
  onEditorChange,
  footnoteMap,
  activeEditorId,
  setActiveEditorId,
}) {
  const [isEditing, setIsEditing] = useState(false);

  const editor = useEditor({
    extensions: [
      ...sharedExtensions,
      Placeholder.configure({
        placeholder: "Tulis konten diskursus Anda...",
      }),
    ],
    content: content || "",
    editable: isEditing,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    onFocus: () => {
      setActiveEditorId("diskursus-content");
      setIsEditing(true);
    },
    onBlur: ({ editor, event }) => {
      setTimeout(() => {
        const relatedTarget = event?.relatedTarget;
        const isToolbarClick =
          relatedTarget?.closest?.(".enhanced-toolbar") ||
          relatedTarget?.closest?.(".toolbar-btn") ||
          relatedTarget?.closest?.(".dropdown-menu") ||
          relatedTarget?.closest?.('[role="menu"]');

        if (isToolbarClick) {
          return;
        }

        setIsEditing(false);
        setActiveEditorId(null);
      }, 150);
    },
  });

  useEffect(() => {
    if (editor && footnoteMap) {
      applyFootnoteNumbers(editor, footnoteMap);
    }
  }, [footnoteMap, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing);
      if (isEditing && onEditorChange) {
        onEditorChange(editor);
      }
    }
  }, [isEditing, editor]);

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
      setActiveEditorId("diskursus-content");
      setTimeout(() => {
        editor?.commands.focus();
      }, 0);
    }
  };

  const renderUnfocusedContent = () => {
    if (!content) return null;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;

    const processElement = (element, index) => {
      const tagName = element.tagName.toLowerCase();

      if (tagName === "p") {
        const charCount = element.textContent.length;
        const remaining = 560 - charCount;

        const colorClass =
          remaining < 0
            ? "text-red-600"
            : remaining < 50
              ? "text-red-500"
              : remaining < 100
                ? "text-amber-500"
                : "text-blue-500";

        return (
          <div key={`p-${index}`} className="relative mb-4">
            <p
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(element.innerHTML),
              }}
            />
            <span
              className={`pointer-events-none absolute right-2 top-1 rounded border border-gray-200 bg-[#F9F6EF]/95 px-1.5 py-0.5 text-xs font-semibold ${colorClass}`}
            >
              {remaining}
            </span>
          </div>
        );
      }

      if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tagName)) {
        const HeadingTag = tagName;
        return (
          <HeadingTag
            key={`${tagName}-${index}`}
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(element.innerHTML),
            }}
            className="mb-2 mt-4"
          />
        );
      }

      if (tagName === "ol") {
        return (
          <ol
            key={`ol-${index}`}
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(element.innerHTML),
            }}
            className="mb-4 pl-8"
          />
        );
      }

      if (tagName === "ul") {
        return (
          <ul
            key={`ul-${index}`}
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(element.innerHTML),
            }}
            className="mb-4 pl-8"
          />
        );
      }

      if (tagName === "blockquote") {
        return (
          <blockquote
            key={`blockquote-${index}`}
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(element.innerHTML),
            }}
            className="mb-4 border-l-4 border-gray-200 pl-4 italic text-gray-500"
          />
        );
      }

      if (tagName === "hr") {
        return (
          <hr
            key={`hr-${index}`}
            className="my-6 border-0 border-t border-gray-200"
          />
        );
      }

      if (tagName === "pre") {
        return (
          <pre
            key={`pre-${index}`}
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(element.innerHTML),
            }}
            className="mb-4 overflow-auto rounded bg-gray-100 p-4"
          />
        );
      }

      return (
        <div
          key={`other-${index}`}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(element.outerHTML) }}
          className="mb-4"
        />
      );
    };

    return (
      <div className="prose prose-sm max-w-none cursor-pointer min-h-[200px]">
        {Array.from(tempDiv.children).map((element, index) =>
          processElement(element, index),
        )}
      </div>
    );
  };

  return (
    <div className="editor-content-shell" onClick={handleClick}>
      {isEditing ? (
        <div className="editor-content-active">
          <EditorContent editor={editor} />
        </div>
      ) : editor && !editor.isEmpty ? (
        <div className="editor-content-preview">{renderUnfocusedContent()}</div>
      ) : (
        <div className="min-h-[120px] cursor-pointer rounded-md border border-dashed border-gray-300 bg-[#F9F6EF] px-4 py-4">
          <h2 className="mb-3 text-xl font-semibold italic text-gray-400">
            Sub judul
          </h2>
          <p className="m-0 italic text-gray-400">Isi diskursus</p>
        </div>
      )}
    </div>
  );
}
