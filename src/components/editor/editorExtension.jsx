import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Mark, mergeAttributes } from "@tiptap/core";
import { Decoration, DecorationSet } from "prosemirror-view";

export const Footnote = Mark.create({
  name: "footnote",
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-footnote-id"),
        renderHTML: (attributes) => {
          if (!attributes.id) return {};
          return { "data-footnote-id": attributes.id };
        },
      },
      number: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-footnote-number"),
        renderHTML: (attributes) => {
          if (!attributes.number) return {};
          return { "data-footnote-number": attributes.number };
        },
      },
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-footnote-id]' }];
  },
  renderHTML({ HTMLAttributes, mark }) {
    const number = mark.attrs.number || "?";
    return [
      "span", 
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 
        class: "footnote-ref",
        "data-footnote-number": String(number)
      }), 
      0
    ];
  },
});

export const Indent = Extension.create({
  name: 'indent',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          indent: {
            default: 0,
            parseHTML: element => {
              const paddingLeft = element.style.paddingLeft;
              return paddingLeft ? parseInt(paddingLeft) / 30 : 0;
            },
            renderHTML: attributes => {
              if (!attributes.indent) {
                return {};
              }
              return {
                style: `padding-left: ${attributes.indent * 30}px`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      indent: () => ({ commands, state }) => {
        const { selection } = state;
        const { $from } = selection;
        const currentIndent = $from.parent.attrs.indent || 0;
        if (currentIndent >= 10) return false;
        return commands.updateAttributes($from.parent.type.name, {
          indent: currentIndent + 1,
        });
      },
      outdent: () => ({ commands, state }) => {
        const { selection } = state;
        const { $from } = selection;
        const currentIndent = $from.parent.attrs.indent || 0;
        if (currentIndent <= 0) return false;
        return commands.updateAttributes($from.parent.type.name, {
          indent: currentIndent - 1,
        });
      },
    };
  },
  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.indent(),
      'Shift-Tab': () => this.editor.commands.outdent(),
    };
  },
});

export const DramaticQuote = Extension.create({
  name: "dramaticQuote",
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  addCommands() {
    return {
      setDramaticQuote: () => ({ commands }) => {
        return commands.setNode("paragraph", { class: "dramatic-quote" });
      },
    };
  },
});


export const ParagraphCounter = Extension.create({
  name: "paragraphCounter",
  addOptions() {
    return {
      maxChars: 560,
      showCounter: true,
      autoSplit: true,
    };
  },
  addProseMirrorPlugins() {
    const maxChars = this.options.maxChars;
    const showCounter = this.options.showCounter;
    const autoSplit = this.options.autoSplit;
    
    const plugins = [];
    
    // Counter decoration plugin
    if (showCounter) {
      plugins.push(
        new Plugin({
          key: new PluginKey("paragraphCounter"),
          props: {
            decorations(state) {
              const decorations = [];
              
              state.doc.descendants((node, pos) => {
                if (node.type.name === "paragraph") {
                  const charCount = node.textContent.length;
                  const remaining = maxChars - charCount;
                  
                  let colorClass = 'counter-normal';
                  if (remaining < 100) colorClass = 'counter-warning';
                  if (remaining < 50) colorClass = 'counter-danger';
                  if (remaining < 0) colorClass = 'counter-over';
                  
                  decorations.push(
                    Decoration.node(pos, pos + node.nodeSize, {
                      'data-char-count': String(charCount),
                      'data-remaining': String(remaining),
                      'data-color-class': colorClass,
                      'class': 'paragraph-with-counter',
                    })
                  );
                }
              });
              
              return DecorationSet.create(state.doc, decorations);
            },
          },
        })
      );
    }
    
    // Auto-split plugin with smart text handling
    if (autoSplit) {
      plugins.push(
        new Plugin({
          key: new PluginKey("paragraphAutoSplit"),
          appendTransaction(transactions, oldState, newState) {
            const docChanged = transactions.some(tr => tr.docChanged);
            if (!docChanged) return null;
            
            const alreadyProcessed = transactions.some(tr => 
              tr.getMeta('paragraphAutoSplit') === true
            );
            if (alreadyProcessed) return null;
            
            let tr = null;
            
            newState.doc.descendants((node, pos) => {
              if (node.type.name === "paragraph") {
                const textContent = node.textContent;
                const charCount = textContent.length;
                
                // Only process if over the limit
                if (charCount > maxChars) {
                  if (!tr) {
                    tr = newState.tr;
                    tr.setMeta('paragraphAutoSplit', true);
                  }
                  
                  // Find the best split point (prefer last space before limit)
                  let splitPoint = maxChars;
                  const textUpToLimit = textContent.substring(0, maxChars);
                  const lastSpaceIndex = textUpToLimit.lastIndexOf(' ');
                  
                  // Use last space if it's reasonably close (not too far back)
                  if (lastSpaceIndex > maxChars - 50) {
                    splitPoint = lastSpaceIndex + 1; // +1 to skip the space
                  }
                  
                  const firstPart = textContent.substring(0, splitPoint).trim();
                  const secondPart = textContent.substring(splitPoint).trim();
                  
                  if (!secondPart) return;
                  
                  let finalSecondPart = secondPart;
                  
                  // Rule 3: Check if second part starts with number
                  if (/^\d/.test(secondPart[0])) {
                    const words = firstPart.split(/\s+/);
                    const lastWord = words[words.length - 1] || '';
                    
                    // Option a: Start with last word + the number
                    finalSecondPart = `Awali kalimat dengan kata ${lastWord} ${secondPart}`;
                    
                    // OR Option b: Use last word from previous paragraph
                    // finalSecondPart = `${lastWord} ${secondPart}`;
                  }
                  // Rule: Ensure starts with capital letter
                  else if (finalSecondPart.length > 0 && finalSecondPart[0] !== finalSecondPart[0].toUpperCase()) {
                    finalSecondPart = finalSecondPart.charAt(0).toUpperCase() + finalSecondPart.slice(1);
                  }
                  
                  // Calculate positions for deletion and split
                  const nodeEnd = pos + node.nodeSize;
                  const contentStart = pos + 1;
                  const deleteFrom = contentStart + splitPoint;
                  const deleteTo = nodeEnd - 1;
                  
                  if (deleteFrom < deleteTo && deleteFrom > contentStart) {
                    // Delete excess content
                    tr.delete(deleteFrom, deleteTo);
                    // Split paragraph
                    tr.split(deleteFrom);
                    // Insert the modified second part
                    tr.insertText(finalSecondPart, deleteFrom + 1);
                  }
                }
              }
            });
            
            return tr;
          },
        })
      );
    }
    
    return plugins;
  },
});

export const SentenceStartValidator = Extension.create({
  name: "sentenceStartValidator",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("sentenceStartValidator"),
        props: {
          handleTextInput(view, from, to, text) {
            const { state } = view;
            const { $from } = state.selection;
            const parent = $from.parent;
            if (parent.type.name === "listItem" || parent.type.name === "bulletList" || parent.type.name === "orderedList") {
              return false;
            }
            const beforeText = parent.textContent.substring(0, $from.parentOffset);
            const isStartOfSentence = beforeText.length === 0 || /[.!?]\s*$/.test(beforeText);
            if (isStartOfSentence && /^\d/.test(text)) {
              return true;
            }
            return false;
          },
        },
      }),
    ];
  },
});

export const PunctuationValidator = Extension.create({
  name: "punctuationValidator",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("punctuationValidator"),
        props: {
          handleTextInput(view, from, to, text) {
            if (!/\d/.test(text)) return false;
            const { state } = view;
            const { $from } = state.selection;
            const textBefore = $from.parent.textContent.substring(0, $from.parentOffset);
            if (textBefore.length < 2) return false;
            const lastTwoChars = textBefore.slice(-2);
            const punctuation = lastTwoChars[0];
            const space = lastTwoChars[1];
            if (space !== " ") return false;
            const allowedPunctuation = [",", ";", "-", "–", "—"];
            if (allowedPunctuation.includes(punctuation)) return false;
            const otherPunctuation = [".", "!", "?", ":", '"', "'", "(", ")", "[", "]", "{", "}"];
            if (otherPunctuation.includes(punctuation)) {
              return true;
            }
            return false;
          },
        },
      }),
    ];
  },
});

export const CurrencyFormatter = Extension.create({
  name: "currencyFormatter",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("currencyFormatter"),
        props: {
          handleTextInput(view, from, to, text) {
            if (!/^\d/.test(text)) return false;
            const { state, dispatch } = view;
            const { $from } = state.selection;
            const textBefore = $from.parent.textContent.substring(0, $from.parentOffset);
            const patterns = [
              { regex: /Rp\s$/i, currency: "Rp" },
              { regex: /IDR\s$/i, currency: "IDR" },
              { regex: /USD\s$/i, currency: "USD" },
            ];
            for (const pattern of patterns) {
              if (pattern.regex.test(textBefore)) {
                const tr = state.tr;
                tr.delete(from - 1, from);
                tr.insertText(text, from - 1);
                dispatch(tr);
                return true;
              }
            }
            return false;
          },
        },
      }),
    ];
  },
});

export const CustomLink = Link.extend({
  name: 'customLink',   
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: "custom-link",
      },
    };
  },
});

export const LimitedOrderedList = Extension.create({
  name: "limitedOrderedList",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("limitedOrderedList"),
        appendTransaction: (transactions, oldState, newState) => {
          const docChanged = transactions.some(tr => tr.docChanged);
          if (!docChanged) return null;
          let tr = null;
          newState.doc.descendants((node, pos) => {
            if (node.type.name === "orderedList") {
              const listType = node.attrs.listType || "decimal";
              let maxItems = 999;
              if (listType === "lower-roman" || listType === "upper-roman") {
                maxItems = 13;
              } else if (listType === "lower-alpha" || listType === "upper-alpha") {
                maxItems = 26 * 26;
              }
              let itemCount = 0;
              node.descendants((child) => {
                if (child.type.name === "listItem") {
                  itemCount++;
                }
              });
              if (itemCount > maxItems) {
                if (!tr) tr = newState.tr;
              }
            }
          });
          return tr;
        },
      }),
    ];
  },
});

export const sharedExtensions = [
  StarterKit.configure({
    history: true,
    underline: false
  }),
  Underline,
  Subscript,
  Superscript,
  CustomLink.configure({
    openOnClick: false,
    HTMLAttributes: { class: 'custom-link' },
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right', 'justify'],
  }),
  Indent,
  Footnote,
  DramaticQuote,
  ParagraphCounter.configure({
    maxChars: 560,
    showCounter: true,
    autoSplit: true,
  }),
  SentenceStartValidator,
  PunctuationValidator,
  CurrencyFormatter,
  LimitedOrderedList,
];

export function generateFootnoteId() {
  return `fn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function applyGlobalFootnoteNumbers(editor, footnoteNumberMap) {
  if (!editor || !footnoteNumberMap) return;

  const { state } = editor;
  let tr = state.tr;

  state.doc.descendants((node, pos) => {
    if (!node.marks) return;

    node.marks.forEach(mark => {
      if (mark.type.name === "footnote") {
        const globalNumber = footnoteNumberMap[mark.attrs.id];
        if (!globalNumber) return;

        if (mark.attrs.number === globalNumber) return;

        const newMark = state.schema.marks.footnote.create({
          ...mark.attrs,
          number: globalNumber,
        });

        tr.removeMark(pos, pos + node.nodeSize, mark);
        tr.addMark(pos, pos + node.nodeSize, newMark);
      }
    });
  });

  if (tr.docChanged) {
    editor.view.dispatch(tr);
  }
}

