export default function sanitizeHtml(dirty) {
  if (!dirty) return "";
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(dirty, "text/html");

    // remove script and style tags
    doc.querySelectorAll("script,style").forEach((n) => n.remove());

    // Remove event handler attributes and unsafe href/src values
    const walker = doc.createTreeWalker(
      doc.body,
      NodeFilter.SHOW_ELEMENT,
      null,
    );
    const elems = [];
    while (walker.nextNode()) elems.push(walker.currentNode);
    elems.forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        const val = (attr.value || "").trim().toLowerCase();
        if (name.startsWith("on")) {
          el.removeAttribute(attr.name);
        }
        if (
          (name === "href" || name === "src") &&
          val.startsWith("javascript:")
        ) {
          el.removeAttribute(attr.name);
        }
      });
    });

    return doc.body.innerHTML;
  } catch (e) {
    // Fail open: if parser not available, return original (caller should be cautious)
    // Log for debugging in development
    if (typeof console !== "undefined") console.warn("sanitizeHtml failed", e);
    return dirty;
  }
}
