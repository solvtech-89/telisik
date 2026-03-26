import { useState } from "react";
import { generateFootnoteId } from "../components/editor/editorExtension";
import { orderFootnotesByMap } from "../utils/articleEditorPayload";

export function useArticleEditorFootnotes({
  currentEditor,
  footnoteMap,
  setAlert,
}) {
  const [showFootnoteModal, setShowFootnoteModal] = useState(false);
  const [footnoteText, setFootnoteText] = useState("");
  const [savedSelection, setSavedSelection] = useState(null);
  const [footnotes, setFootnotes] = useState([]);

  const closeFootnoteModal = () => {
    setShowFootnoteModal(false);
    setFootnoteText("");
    setSavedSelection(null);
  };

  const handleAddFootnote = () => {
    if (!currentEditor) return;

    const { from, to } = currentEditor.state.selection;
    if (from === to) {
      setAlert({
        type: "warning",
        message: "Pilih teks terlebih dahulu sebelum menambahkan catatan kaki.",
      });
      return;
    }

    setSavedSelection({ from, to });
    setShowFootnoteModal(true);
  };

  const handleFootnoteSubmit = () => {
    if (!footnoteText.trim()) {
      setAlert({
        type: "warning",
        message: "Isi catatan kaki tidak boleh kosong.",
      });
      return;
    }

    if (!savedSelection || !currentEditor) return;

    const id = generateFootnoteId();

    currentEditor
      .chain()
      .focus()
      .setTextSelection(savedSelection)
      .setMark("footnote", { id })
      .run();

    setFootnotes((prev) => [...prev, { id, content: footnoteText }]);
    closeFootnoteModal();
  };

  const orderedFootnotes = orderFootnotesByMap(footnotes, footnoteMap);

  return {
    footnotes,
    orderedFootnotes,
    showFootnoteModal,
    footnoteText,
    setFootnoteText,
    closeFootnoteModal,
    handleAddFootnote,
    handleFootnoteSubmit,
  };
}
