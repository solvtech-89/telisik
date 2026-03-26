export function buildGlobalFootnoteMap(sectionContents, diskursusContent = null) {
  const allFootnoteIds = [];

  if (diskursusContent) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = diskursusContent;
    const footnoteRefs = tempDiv.querySelectorAll("[data-footnote-id]");

    footnoteRefs.forEach((ref) => {
      const id = ref.getAttribute("data-footnote-id");
      if (id && !allFootnoteIds.includes(id)) {
        allFootnoteIds.push(id);
      }
    });
  }

  Object.values(sectionContents).forEach((content) => {
    if (!content) return;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const footnoteRefs = tempDiv.querySelectorAll("[data-footnote-id]");

    footnoteRefs.forEach((ref) => {
      const id = ref.getAttribute("data-footnote-id");
      if (id && !allFootnoteIds.includes(id)) {
        allFootnoteIds.push(id);
      }
    });
  });

  const map = {};
  allFootnoteIds.forEach((id, index) => {
    map[id] = index + 1;
  });

  return map;
}
