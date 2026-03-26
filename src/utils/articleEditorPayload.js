import { isTimelineSection } from "./articleEditorSections";

export function findFirstImageMissingSource(images) {
  return images.findIndex((image) => !image.sumber.trim());
}

export function orderFootnotesByMap(footnotes, footnoteMap) {
  return footnotes
    .map((footnote) => ({
      ...footnote,
      number: footnoteMap[footnote.id],
    }))
    .filter((footnote) => footnote.number !== undefined)
    .sort((left, right) => left.number - right.number);
}

export function buildArticlePayload({
  articleType,
  title,
  excerpt,
  contentType,
  bookTitle,
  bookAuthor,
  bookPublisher,
  bookYear,
  diskursusContent,
  footnotes,
  images,
  category,
  actors,
  locationData,
  sections,
  sectionContents,
  timelineData,
}) {
  if (articleType === "DISKURSUS") {
    return {
      type: articleType,
      title,
      excerpt,
      contentType,
      ...(contentType === "resensi" && {
        bookTitle,
        bookAuthor,
        bookPublisher,
        bookYear,
      }),
      content: diskursusContent,
      footnotes,
      images: images.slice(0, 1).map((image) => ({
        name: image.name,
        preview: image.preview,
        sumber: image.sumber,
        keterangan: image.keterangan,
        teksAlternatif: image.teksAlternatif,
        isMain: true,
      })),
    };
  }

  return {
    type: articleType,
    title,
    excerpt,
    category,
    actors,
    location: locationData,
    sections: sections.map((section) => {
      if (isTimelineSection(section.key)) {
        return {
          ...section,
          content: sectionContents[section.id],
          timelineData,
        };
      }

      return {
        ...section,
        content: sectionContents[section.id],
      };
    }),
    footnotes,
    images: images.map((image, index) => ({
      name: image.name,
      preview: image.preview,
      sumber: image.sumber,
      keterangan: image.keterangan,
      teksAlternatif: image.teksAlternatif,
      isMain: index === 0,
    })),
  };
}
