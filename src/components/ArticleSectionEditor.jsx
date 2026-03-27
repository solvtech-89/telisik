import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import { sharedExtensions } from "./editor/editorExtension";

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

export default function ArticleSectionEditor({
  section,
  sectionContent,
  activeEditorId,
  setActiveEditorId,
  setActiveEditor,
  onUpdate,
  onEditorChange,
  footnoteMap,
}) {
  const editor = useEditor({
    extensions: [
      ...sharedExtensions,
      Placeholder.configure({
        placeholder: `Tulis paparan ${section.title}`,
      }),
    ],
    content: sectionContent || "",
    editable: activeEditorId === section.id,
    onUpdate: ({ editor }) => {
      onUpdate(section.id, editor.getHTML());
    },
    onFocus: () => {
      setActiveEditor(section.id);
      setActiveEditorId(section.id);
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

        if (editor.isEmpty) {
          if (activeEditorId === section.id) {
            setActiveEditorId(null);
            setActiveEditor(null);
          }
        } else {
          setActiveEditorId(null);
          setActiveEditor(null);
        }
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
      editor.setEditable(activeEditorId === section.id);
      if (activeEditorId === section.id && onEditorChange) {
        onEditorChange(editor);
      }
    }
  }, [activeEditorId, editor, section.id]);

  const renderUnfocusedContent = () => {
    if (!sectionContent) return null;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = sectionContent;
    const paragraphs = tempDiv.querySelectorAll("p");

    return (
      <div className="prose prose-sm max-w-none cursor-pointer min-h-[200px]">
        {Array.from(paragraphs).map((paragraph, idx) => {
          const charCount = paragraph.textContent.length;
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
            <div key={idx} className="relative mb-4">
              <p dangerouslySetInnerHTML={{ __html: paragraph.innerHTML }} />
              <span
                className={`pointer-events-none absolute right-2 top-1 rounded border border-gray-200 bg-white/95 px-1.5 py-0.5 text-xs font-semibold ${colorClass}`}
              >
                {remaining}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="editor-content-shell"
      onClick={() => {
        if (activeEditorId !== section.id) {
          setActiveEditorId(section.id);
          setActiveEditor(section.id);
          setTimeout(() => {
            editor?.commands.focus();
          }, 0);
        }
      }}
    >
      {activeEditorId === section.id ? (
        <div className="editor-content-active">
          <EditorContent editor={editor} />
        </div>
      ) : editor && !editor.isEmpty ? (
        <div className="editor-content-preview">{renderUnfocusedContent()}</div>
      ) : (
        <p className="min-h-[120px] cursor-pointer rounded-md border border-dashed border-gray-300 bg-white px-4 py-4 italic text-gray-400">
          Tulis paparan {section.title}
        </p>
      )}
    </div>
  );
}
