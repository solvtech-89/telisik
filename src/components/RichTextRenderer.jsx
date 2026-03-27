import React from "react";

/**
 * RichTextRenderer - Renders TipTap/ProseMirror JSON content
 * Supports paragraphs, headings, lists, text formatting, etc.
 */
export default function RichTextRenderer({ content }) {
  if (!content) return null;

  // Handle string content
  if (typeof content === "string") {
    return <p>{content}</p>;
  }

  // Handle TipTap/ProseMirror document structure
  if (content.type === "doc" && content.content) {
    return <>{renderNodes(content.content)}</>;
  }

  return null;
}

function renderNodes(nodes) {
  if (!Array.isArray(nodes)) return null;

  return nodes.map((node, index) => renderNode(node, index));
}

function renderNode(node, key) {
  switch (node.type) {
    case "paragraph":
      return (
        <p key={key} className="mb-3">
          {renderContent(node.content)}
        </p>
      );

    case "heading":
      const HeadingTag = `h${node.attrs?.level || 2}`;
      return (
        <HeadingTag key={key} className="font-bold mb-2">
          {renderContent(node.content)}
        </HeadingTag>
      );

    case "bulletList":
      return (
        <ul key={key} className="mb-3">
          {renderNodes(node.content)}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={key} className="mb-3">
          {renderNodes(node.content)}
        </ol>
      );

    case "listItem":
      return <li key={key}>{renderContent(node.content)}</li>;

    case "blockquote":
      return (
        <blockquote key={key} className="mb-3 border-l-4 border-gray-300 pl-3">
          {renderNodes(node.content)}
        </blockquote>
      );

    case "codeBlock":
      return (
        <pre key={key} className="mb-3 rounded bg-gray-100 p-3">
          <code>{renderContent(node.content)}</code>
        </pre>
      );

    case "hardBreak":
      return <br key={key} />;

    case "text":
      return renderTextNode(node, key);

    default:
      // Fallback for unknown node types
      if (node.content) {
        return <span key={key}>{renderContent(node.content)}</span>;
      }
      return null;
  }
}

function renderContent(content) {
  if (!content) return null;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((node, index) => {
      if (node.type === "text") {
        return renderTextNode(node, index);
      }
      return renderNode(node, index);
    });
  }
  return null;
}

function renderTextNode(node, key) {
  let text = node.text || "";
  let element = <span key={key}>{text}</span>;

  // Apply marks (formatting)
  if (node.marks && Array.isArray(node.marks)) {
    node.marks.forEach((mark) => {
      switch (mark.type) {
        case "bold":
          element = <strong key={key}>{element}</strong>;
          break;
        case "italic":
          element = <em key={key}>{element}</em>;
          break;
        case "underline":
          element = <u key={key}>{element}</u>;
          break;
        case "strike":
          element = <s key={key}>{element}</s>;
          break;
        case "code":
          element = (
            <code key={key} className="rounded bg-gray-100 px-1">
              {element}
            </code>
          );
          break;
        case "link":
          element = (
            <a
              key={key}
              href={mark.attrs?.href}
              target={mark.attrs?.target}
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {element}
            </a>
          );
          break;
        default:
          break;
      }
    });
  }

  return element;
}

// Export a simple text extractor for cases where you just need plain text
export function extractPlainText(content) {
  if (!content) return "";

  if (typeof content === "string") return content;

  const extractFromNodes = (nodes) => {
    if (!Array.isArray(nodes)) return "";
    return nodes
      .map((node) => {
        if (node.type === "text") return node.text || "";
        if (node.content) return extractFromNodes(node.content);
        return "";
      })
      .join("");
  };

  if (content.type === "doc" && content.content) {
    return extractFromNodes(content.content);
  }

  return "";
}
