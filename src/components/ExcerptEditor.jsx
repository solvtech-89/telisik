import React, { useEffect, useRef, useState } from "react";
import TitleLeadCounter from "./TitleLeadCounter";

export default function ExcerptEditor({ value, onChange, maxLength = 155 }) {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const currentLength = value.length;
  const placeholderText =
    "Tulis lead/excerpt (wajib) maksimal 155 karakter termasuk spasi";

  useEffect(() => {
    if (editorRef.current) {
      if (!isFocused && !value) {
        editorRef.current.textContent = placeholderText;
      } else if (editorRef.current.textContent !== value && value) {
        editorRef.current.textContent = value;
      }
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    if (
      editorRef.current &&
      editorRef.current.textContent === placeholderText
    ) {
      editorRef.current.textContent = "";
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const text = editorRef.current.textContent || "";
    if (!text.trim()) {
      editorRef.current.textContent = placeholderText;
      onChange("");
    }
  };

  const handleInput = (e) => {
    const text = e.currentTarget.textContent || "";
    if (text === placeholderText) return;

    if (text.length <= maxLength) {
      onChange(text);
    } else {
      e.currentTarget.textContent = value;
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(e.currentTarget);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const currentText = value || "";
    const newText = currentText + text;

    if (newText.length <= maxLength) {
      document.execCommand("insertText", false, text);
    } else {
      const allowedText = text.substring(0, maxLength - currentText.length);
      if (allowedText) {
        document.execCommand("insertText", false, allowedText);
      }
    }
  };

  const isPlaceholder = !value && !isFocused;

  return (
    <div className="relative mb-0">
      <input type="hidden" value={value} name="excerpt" />
      <TitleLeadCounter current={currentLength} max={maxLength} />
      <h3
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`editor-article-excerpt mt-4 min-h-[60px] w-full rounded border-none bg-transparent px-3 pr-[70px] text-[22px] font-semibold leading-tight outline-none [overflow-wrap:anywhere] ${
          isPlaceholder ? "text-[#CECB9C]" : "text-[#FC6736]"
        }`}
      >
        {placeholderText}
      </h3>
    </div>
  );
}
