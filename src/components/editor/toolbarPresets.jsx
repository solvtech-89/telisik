export const TOOLBAR_PRESETS = {
  FULL: {
    history: true,
    heading: true,
    textFormat: true,
    footnote: true,
    alignment: true,
    indent: true,
    list: true,
    blockquote: true,
    link: true,
    actions: true,
  },

  MINIMAL: {
    history: false,
    heading: true,
    textFormat: true,
    footnote: false,
    alignment: false,
    indent: false,
    list: false,
    blockquote: false,
    link: false,
    actions: false,
  },

  STANDARD: {
    history: true,
    heading: true,
    textFormat: true,
    footnote: false,
    alignment: false,
    indent: true,
    list: true,
    blockquote: false,
    link: true,
    actions: false,
  },

  COMMENT: {
    history: true,
    heading: false,
    textFormat: true,
    footnote: false,
    alignment: false,
    indent: false,
    list: true,
    blockquote: true,
    link: true,
    actions: false,
  },

  ARTICLE: {
    history: true,
    heading: true,
    textFormat: true,
    footnote: true,
    alignment: true,
    indent: false,
    list: true,
    blockquote: true,
    link: true,
    actions: true,
  },

  READONLY: {
    history: false,
    heading: false,
    textFormat: false,
    footnote: false,
    alignment: false,
    indent: false,
    list: false,
    blockquote: false,
    link: false,
    actions: false,
  },
};

export function createToolbarConfig(overrides = {}) {
  return {
    ...TOOLBAR_PRESETS.FULL,
    ...overrides,
  };
}