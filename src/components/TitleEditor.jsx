import React, { useEffect, useRef, useState } from "react";
import TitleLeadCounter from "./TitleLeadCounter";

export default function TitleEditor({
  value,
  onChange,
  maxLength = 60,
  articleType = "KRONIK",
}) {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const currentLength = value.length;
  const placeholderText = `Tulis Judul ${articleType} Maksimal 60 Karakter Termasuk Spasi`;

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const isPlaceholder = !value && !isFocused;

  return (
    <div className="relative mb-0">
      <input type="hidden" value={value} name="title" />
      <TitleLeadCounter current={currentLength} max={maxLength} />
      <h1
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`m-0 min-h-[60px] w-full rounded bg-transparent px-3 pr-[70px] text-[40px] font-bold leading-tight outline-none [overflow-wrap:anywhere] ${
          isPlaceholder ? "text-[#CDCB9C]" : "text-[#555333]"
        }`}
      >
        {placeholderText}
      </h1>
    </div>
  );
}
