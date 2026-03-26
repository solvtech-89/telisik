import { Mark, mergeAttributes } from '@tiptap/core'

export const FootnoteMark = Mark.create({
  name: 'footnote',

  inclusive: false,

  addAttributes() {
    return {
      id: {
        default: null,
        renderHTML: attrs => ({
          'data-footnote-id': attrs.id,
        }),
      },
      number: {
        default: null,
        renderHTML: attrs => ({
          'data-footnote-number': attrs.number,
        }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-footnote-id]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class: 'footnote-ref',
      }),
    ]
  },
})
