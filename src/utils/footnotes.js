export function buildFootnoteMapFromHTML(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const nodes = doc.querySelectorAll('[data-footnote-id]')

  const map = {}
  let counter = 1

  nodes.forEach(node => {
    const id = node.getAttribute('data-footnote-id')
    if (!map[id]) {
      map[id] = counter++
    }
  })

  return map
}
