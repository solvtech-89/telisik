import React from "react";
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconH1,
  IconH2,
  IconH3,
  IconH4,
  IconH5,
  IconQuote,
  IconList,
  IconListNumbers,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignJustified,
  IconLink,
  IconUnlink,
  IconArrowBack,
  IconArrowForward,
  IconIndentIncrease,
  IconIndentDecrease,
} from "@tabler/icons-react";
import Dropdown from "./Dropdown";
import DropdownItem from "./DropdownItem";

// Default configuration - all features enabled
const DEFAULT_CONFIG = {
  history: true,
  heading: true,
  textFormat: true,
  footnote: true,
  alignment: true,
  indent: true,
  list: true,
  blockquote: true,
  link: true,
  actions: true, // Cancel, Save Draft, Publish buttons
};

export default function Toolbar({
  editor,
  onAddFootnote,
  isEditing,
  onCancel,
  onSaveDraft,
  onPublish,
  config = {}, // Allow custom configuration
}) {
  if (!editor) return null;

  // Merge user config with defaults
  const toolbarConfig = { ...DEFAULT_CONFIG, ...config };

  const setLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="enhanced-toolbar">
      {toolbarConfig.history && (
        <>
          <div className="toolbar-group">
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="toolbar-btn"
            >
              <IconArrowBack size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="toolbar-btn"
            >
              <IconArrowForward size={18} />
            </button>
          </div>
          <div className="toolbar-separator"></div>
        </>
      )}

      {toolbarConfig.heading && (
        <>
          <div className="toolbar-group">
            <Dropdown
              trigger={
                <button
                  type="button"
                  title="Heading"
                  className="toolbar-btn inline-flex items-center gap-1"
                >
                  <svg
                    width="12"
                    height="14"
                    viewBox="0 0 12 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.75 0.75V12.75"
                      stroke="var(--s-bodyText, #555333)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.75 0.75V6.75M10.75 12.75V6.75M0.75 6.75H10.75"
                      stroke="var(--s-bodyText, #555333)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              }
            >
              <DropdownItem
                icon={<IconH1 size={18} />}
                label="Heading 1"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                isActive={editor.isActive("heading", { level: 1 })}
              />
              <DropdownItem
                icon={<IconH2 size={18} />}
                label="Heading 2"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                isActive={editor.isActive("heading", { level: 2 })}
              />
              <DropdownItem
                icon={<IconH3 size={18} />}
                label="Heading 3"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                isActive={editor.isActive("heading", { level: 3 })}
              />
              <DropdownItem
                icon={<IconH4 size={18} />}
                label="Heading 4"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 4 }).run()
                }
                isActive={editor.isActive("heading", { level: 4 })}
              />
              <DropdownItem
                icon={<IconH5 size={18} />}
                label="Heading 5"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 5 }).run()
                }
                isActive={editor.isActive("heading", { level: 5 })}
              />
            </Dropdown>
          </div>
          <div className="toolbar-separator"></div>
        </>
      )}

      {toolbarConfig.textFormat && (
        <>
          <div className="toolbar-group">
            <Dropdown
              trigger={
                <button
                  type="button"
                  title="Text Format"
                  className="toolbar-btn inline-flex items-center gap-1"
                >
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
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M3 7v-2h13v2" />
                    <path d="M10 5v14" />
                    <path d="M12 19h-4" />
                    <path d="M15 13v-1h6v1" />
                    <path d="M18 12v7" />
                    <path d="M17 19h2" />
                  </svg>
                </button>
              }
            >
              <DropdownItem
                icon={<IconBold size={18} />}
                label="Bold"
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")}
              />
              <DropdownItem
                icon={<IconItalic size={18} />}
                label="Italic"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive("italic")}
              />
              <DropdownItem
                icon={<IconUnderline size={18} />}
                label="Underline"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive("underline")}
              />
              <DropdownItem
                icon={<IconStrikethrough size={18} />}
                label="Strikethrough"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive("strike")}
              />
            </Dropdown>
          </div>
          <div className="toolbar-separator"></div>
        </>
      )}

      {toolbarConfig.footnote && onAddFootnote && (
        <>
          <div className="toolbar-group">
            <button
              type="button"
              onClick={onAddFootnote}
              className={`toolbar-btn ${editor.isActive("footnote") ? "active" : ""}`}
              title="Footnote"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.4707 13.6215V6.10254C4.4707 4.44568 5.81385 3.10254 7.4707 3.10254H9.00673"
                  stroke="#555333"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7.5957 8.36182H2.5957"
                  stroke="#555333"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.47075 13.6938L2.4707 13.6938"
                  stroke="#555333"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.3165 7.80615H11.8789V7.02495C11.8789 6.47857 12.1821 5.98413 12.6512 5.76516L14.5641 4.87255C15.0211 4.65926 15.3165 4.17761 15.3165 3.6455C15.3165 2.90579 14.7542 2.30615 14.0608 2.30615H13.168C12.6067 2.30615 12.1292 2.68877 11.9523 3.22282"
                  stroke="#555333"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              className={`toolbar-btn ${editor.isActive("subscript") ? "active" : ""}`}
              title="Subscript"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.26172 12L9.26172 6"
                  stroke="var(--s-bodyText, #555333)"
                  strokeLinecap="round"
                />
                <path
                  d="M9.26172 12L3.26172 6"
                  stroke="var(--s-bodyText, #555333)"
                  strokeLinecap="round"
                />
                <path
                  d="M14.7384 15.5H11.3008V14.7188C11.3008 14.1724 11.604 13.678 12.0731 13.459L13.986 12.5664C14.443 12.3531 14.7384 11.8715 14.7384 11.3393C14.7384 10.5996 14.1761 10 13.4827 10H12.5899C12.0285 10 11.5511 10.3826 11.3741 10.9167"
                  stroke="var(--s-bodyText, #555333)"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              className={`toolbar-btn ${editor.isActive("superscript") ? "active" : ""}`}
              title="Superscript"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.26172 12L9.26172 6"
                  stroke="var(--s-bodyText, #555333)"
                  strokeLinecap="round"
                />
                <path
                  d="M9.26172 12L3.26172 6"
                  stroke="var(--s-bodyText, #555333)"
                  strokeLinecap="round"
                />
                <path
                  d="M14.7384 8H11.3008V7.21879C11.3008 6.67241 11.604 6.17798 12.0731 5.95901L13.986 5.06639C14.443 4.85311 14.7384 4.37146 14.7384 3.83934C14.7384 3.09964 14.1761 2.5 13.4827 2.5H12.5899C12.0285 2.5 11.5511 2.88262 11.3741 3.41667"
                  stroke="var(--s-bodyText, #555333)"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="toolbar-separator"></div>
        </>
      )}

      {toolbarConfig.alignment && (
        <>
          <div className="toolbar-group">
            <Dropdown
              trigger={
                <button
                  type="button"
                  className="toolbar-btn inline-flex items-center gap-1"
                >
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
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M4 4v16" />
                    <path d="M8 6h12" />
                    <path d="M8 12h6" />
                    <path d="M8 18h10" />
                  </svg>
                </button>
              }
            >
              <DropdownItem
                icon={<IconAlignLeft size={18} />}
                label="Align Left"
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                isActive={editor.isActive({ textAlign: "left" })}
              />
              <DropdownItem
                icon={<IconAlignCenter size={18} />}
                label="Align Center"
                onClick={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                isActive={editor.isActive({ textAlign: "center" })}
              />
              <DropdownItem
                icon={<IconAlignRight size={18} />}
                label="Align Right"
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                isActive={editor.isActive({ textAlign: "right" })}
              />
              <DropdownItem
                icon={<IconAlignJustified size={18} />}
                label="Justify"
                onClick={() =>
                  editor.chain().focus().setTextAlign("justify").run()
                }
                isActive={editor.isActive({ textAlign: "justify" })}
              />
            </Dropdown>
          </div>
          <div className="toolbar-separator"></div>
        </>
      )}

      {toolbarConfig.indent && (
        <>
          <div className="toolbar-group">
            <Dropdown
              trigger={
                <button
                  type="button"
                  className="toolbar-btn inline-flex items-center gap-1"
                >
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
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M11 9h-2a3 3 0 1 1 0 -6h7" />
                    <path d="M11 3v11" />
                    <path d="M15 3v11" />
                    <path d="M21 18h-18" />
                    <path d="M18 15l3 3l-3 3" />
                  </svg>
                </button>
              }
            >
              <DropdownItem
                icon={<IconIndentDecrease size={18} />}
                label="Decrease Indent"
                onClick={() => editor.chain().focus().outdent().run()}
                isActive={false}
              />
              <DropdownItem
                icon={<IconIndentIncrease size={18} />}
                label="Increase Indent"
                onClick={() => editor.chain().focus().indent().run()}
                isActive={false}
              />
            </Dropdown>
          </div>
          <div className="toolbar-separator"></div>
        </>
      )}

      {toolbarConfig.list && (
        <>
          <div className="toolbar-group">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`toolbar-btn ${editor.isActive("bulletList") ? "active" : ""}`}
            >
              <IconList size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`toolbar-btn ${editor.isActive("orderedList") ? "active" : ""}`}
            >
              <IconListNumbers size={18} />
            </button>
          </div>
          <div className="toolbar-separator"></div>
        </>
      )}

      {toolbarConfig.blockquote && (
        <>
          <div className="toolbar-group">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`toolbar-btn ${editor.isActive("blockquote") ? "active" : ""}`}
            >
              <IconQuote size={18} />
            </button>
          </div>
          <div className="toolbar-separator"></div>
        </>
      )}

      {toolbarConfig.link && (
        <>
          <div className="toolbar-group">
            <button
              type="button"
              onClick={setLink}
              className={`toolbar-btn ${editor.isActive("link") ? "active" : ""}`}
            >
              <IconLink size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              disabled={!editor.isActive("link")}
              className="toolbar-btn"
            >
              <IconUnlink size={18} />
            </button>
          </div>
          <div className="toolbar-separator"></div>
        </>
      )}

      {toolbarConfig.actions && isEditing && (
        <div className="toolbar-group">
          <button
            type="button"
            onClick={onCancel}
            className="toolbar-btn toolbar-btn-cancel px-3 py-1 text-sm rounded-full"
          >
            Batalkan
          </button>
          <button
            type="button"
            onClick={onSaveDraft}
            className="toolbar-btn toolbar-btn-save px-3 py-1 text-sm rounded-full"
          >
            Simpan Draf
          </button>
          <button
            type="button"
            onClick={onPublish}
            className="toolbar-btn toolbar-btn-publish px-3 py-1 text-sm rounded-full"
          >
            Terbitkan
          </button>
        </div>
      )}
    </div>
  );
}
