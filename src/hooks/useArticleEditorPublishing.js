import { useState } from "react";
import { API_BASE } from "../config";
import { findFirstImageMissingSource } from "../utils/articleEditorPayload";

export function useArticleEditorPublishing({
  images,
  createArticleData,
  setAlert,
  setFocusImageIndex,
}) {
  const [savedArticleId, setSavedArticleId] = useState(null);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showPublishSuccessModal, setShowPublishSuccessModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleSaveDraftClick = () => {
    if (images.length > 0) {
      const emptySourceIndex = findFirstImageMissingSource(images);
      if (emptySourceIndex !== -1) {
        setAlert({
          type: "danger",
          message: `Gambar ${emptySourceIndex + 1} belum memiliki sumber. Harap isi sumber untuk semua gambar.`,
        });
        setFocusImageIndex(emptySourceIndex);
        return;
      }
    }

    setShowSaveDraftModal(true);
  };

  const handleConfirmSaveDraft = async () => {
    setIsSaving(true);

    try {
      const articleData = createArticleData();
      const response = await fetch(`${API_BASE}/articles/save-draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(articleData),
      });

      if (!response.ok) {
        throw new Error("Failed to save draft");
      }

      const data = await response.json();
      setSavedArticleId(data.id);
      setShowSaveDraftModal(false);
      setShowSaveSuccessModal(true);
    } catch (error) {
      console.error("Error saving draft:", error);
      setAlert({
        type: "danger",
        message: "Gagal menyimpan draft. Silakan coba lagi.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishClick = () => {
    if (!savedArticleId) {
      setAlert({
        type: "danger",
        message: "Silakan simpan draft terlebih dahulu sebelum menerbitkan.",
      });
      return;
    }

    setShowPublishModal(true);
  };

  const handleConfirmPublish = async () => {
    setIsPublishing(true);

    try {
      const response = await fetch(
        `${API_BASE}/articles/${savedArticleId}/publish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to publish article");
      }

      setShowPublishModal(false);
      setShowPublishSuccessModal(true);
    } catch (error) {
      console.error("Error publishing article:", error);
      setAlert({
        type: "danger",
        message: "Gagal menerbitkan artikel. Silakan coba lagi.",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return {
    savedArticleId,
    showSaveDraftModal,
    setShowSaveDraftModal,
    showSaveSuccessModal,
    setShowSaveSuccessModal,
    showPublishModal,
    setShowPublishModal,
    showPublishSuccessModal,
    setShowPublishSuccessModal,
    isSaving,
    isPublishing,
    handleSaveDraftClick,
    handleConfirmSaveDraft,
    handlePublishClick,
    handleConfirmPublish,
  };
}
