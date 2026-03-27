import { useEffect, useState } from "react";
import { EditorContent } from "@tiptap/react";

export default function ParagraphCounterWrapper({
  editor,
  maxChars = 560,
  children,
}) {
  const [paragraphCounts, setParagraphCounts] = useState([]);

  useEffect(() => {
    if (!editor) return;

    const updateCounters = () => {
      const counts = [];

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "paragraph") {
          const charCount = node.textContent.length;
          const remaining = maxChars - charCount;

          counts.push({
            pos,
            charCount,
            remaining,
          });
        }
      });

      setParagraphCounts(counts);
    };

    // Update on editor changes
    editor.on("update", updateCounters);
    editor.on("selectionUpdate", updateCounters);

    // Initial update
    updateCounters();

    return () => {
      editor.off("update", updateCounters);
      editor.off("selectionUpdate", updateCounters);
    };
  }, [editor, maxChars]);

  useEffect(() => {
    if (!editor) return;

    // Add counters to DOM paragraphs
    const editorElement = editor.view.dom;
    const paragraphs = editorElement.querySelectorAll("p");

    paragraphs.forEach((p, index) => {
      // Remove existing counter
      const existingCounter = p.querySelector(".paragraph-counter");
      if (existingCounter) {
        existingCounter.remove();
      }

      const count = paragraphCounts[index];
      if (!count) return;

      const { charCount, remaining } = count;

      // Only show counter if paragraph has content
      if (charCount > 0) {
        const counter = document.createElement("div");
        counter.className =
          "absolute right-2 top-1 z-10 pointer-events-none select-none";
        counter.contentEditable = "false";

        p.style.position = "relative";
        p.style.paddingRight = "70px";

        let badgeClass =
          "rounded bg-[rgba(0,136,255,0.06)] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#016bc7]";
        if (remaining < 100)
          badgeClass =
            "rounded bg-[#e65100] px-2 py-0.5 font-mono text-[11px] font-semibold text-white";
        if (remaining < 50)
          badgeClass =
            "rounded bg-[#ffebee] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#c62828]";
        if (remaining < 0)
          badgeClass =
            "rounded bg-[#f44336] px-2 py-0.5 font-mono text-[11px] font-semibold text-white";

        const badge = document.createElement("span");
        badge.className = badgeClass;
        badge.textContent = String(remaining);
        counter.appendChild(badge);

        p.appendChild(counter);
      }
    });
  }, [editor, paragraphCounts]);

  return children || <EditorContent editor={editor} />;
}

/**
 * Alternative: Use as a hook
 */
export function useParagraphCounter(editor, maxChars = 560) {
  const [counts, setCounts] = useState([]);

  useEffect(() => {
    if (!editor) return;

    const updateCounters = () => {
      const newCounts = [];

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "paragraph") {
          const charCount = node.textContent.length;
          const remaining = maxChars - charCount;

          newCounts.push({
            pos,
            charCount,
            remaining,
            status:
              remaining < 0
                ? "over"
                : remaining < 50
                  ? "danger"
                  : remaining < 100
                    ? "warning"
                    : "normal",
          });
        }
      });

      setCounts(newCounts);
    };

    editor.on("update", updateCounters);
    editor.on("selectionUpdate", updateCounters);
    updateCounters();

    return () => {
      editor.off("update", updateCounters);
      editor.off("selectionUpdate", updateCounters);
    };
  }, [editor, maxChars]);

  return counts;
}
