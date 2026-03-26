import { useEffect, useState } from "react";
import { buildGlobalFootnoteMap } from "../utils/articleEditorFootnotes";
import {
  createInitialSectionContents,
  createInitialSections,
} from "../utils/articleEditorSections";

export function useArticleEditorState({ tipe, user, navigate }) {
  const articleType = tipe.toUpperCase();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [activeEditorId, setActiveEditorId] = useState(null);
  const [activeEditor, setActiveEditor] = useState(null);
  const [timelineEditor, setTimelineEditor] = useState(null);
  const [sectionEditor, setSectionEditor] = useState(null);
  const [footnoteMap, setFootnoteMap] = useState({});
  const [images, setImages] = useState([]);
  const [timelineData, setTimelineData] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [focusImageIndex, setFocusImageIndex] = useState(null);
  const [contentType, setContentType] = useState("blog");
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookPublisher, setBookPublisher] = useState("");
  const [bookYear, setBookYear] = useState("");
  const [diskursusContent, setDiskursusContent] = useState("");
  const [diskursusEditor, setDiskursusEditor] = useState(null);
  const [category, setCategory] = useState();
  const [actors, setActors] = useState([]);
  const [locationData, setLocationData] = useState(null);

  const [sections, setSections] = useState(() => createInitialSections(articleType));
  const [sectionContents, setSectionContents] = useState(() =>
    createInitialSectionContents(createInitialSections(articleType)),
  );

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const newMap = buildGlobalFootnoteMap(
      articleType === "DISKURSUS" ? {} : sectionContents,
      articleType === "DISKURSUS" ? diskursusContent : null,
    );
    setFootnoteMap(newMap);
  }, [user, navigate, sectionContents, diskursusContent, articleType]);

  useEffect(() => {
    const nextSections = createInitialSections(articleType);
    setSections(nextSections);
    setSectionContents(createInitialSectionContents(nextSections));
    setActiveEditorId(null);
  }, [articleType]);

  const currentEditor =
    articleType === "DISKURSUS"
      ? diskursusEditor
      : sectionEditor || timelineEditor;

  const navItems = sections.map((section) => ({
    id: section.id,
    key: section.key,
    title: section.title,
  }));

  const handleSectionUpdate = (sectionId, content) => {
    setSectionContents((prev) => ({
      ...prev,
      [sectionId]: content,
    }));
  };

  return {
    articleType,
    title,
    setTitle,
    excerpt,
    setExcerpt,
    collapsed,
    setCollapsed,
    activeEditorId,
    setActiveEditorId,
    activeEditor,
    setActiveEditor,
    timelineEditor,
    setTimelineEditor,
    sectionEditor,
    setSectionEditor,
    footnoteMap,
    images,
    setImages,
    timelineData,
    setTimelineData,
    alert,
    setAlert,
    focusImageIndex,
    setFocusImageIndex,
    contentType,
    setContentType,
    bookTitle,
    setBookTitle,
    bookAuthor,
    setBookAuthor,
    bookPublisher,
    setBookPublisher,
    bookYear,
    setBookYear,
    diskursusContent,
    setDiskursusContent,
    diskursusEditor,
    setDiskursusEditor,
    category,
    setCategory,
    actors,
    setActors,
    locationData,
    setLocationData,
    sections,
    sectionContents,
    currentEditor,
    navItems,
    handleSectionUpdate,
  };
}
