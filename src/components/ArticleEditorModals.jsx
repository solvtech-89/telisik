import React from "react";
import ConfirmActionModal from "./ConfirmActionModal";
import SuccessStatusModal from "./SuccessStatusModal";
import FootnoteModal from "./FootnoteModal";

export default function ArticleEditorModals({
  showFootnoteModal,
  footnoteText,
  setFootnoteText,
  closeFootnoteModal,
  handleFootnoteSubmit,
  showSaveDraftModal,
  setShowSaveDraftModal,
  isSaving,
  handleConfirmSaveDraft,
  showSaveSuccessModal,
  setShowSaveSuccessModal,
  showPublishModal,
  setShowPublishModal,
  isPublishing,
  handleConfirmPublish,
  showPublishSuccessModal,
  setShowPublishSuccessModal,
  savedArticleId,
}) {
  return (
    <>
      <FootnoteModal
        show={showFootnoteModal}
        value={footnoteText}
        onChange={setFootnoteText}
        onClose={closeFootnoteModal}
        onSubmit={handleFootnoteSubmit}
      />

      <ConfirmActionModal
        show={showSaveDraftModal}
        onClose={() => setShowSaveDraftModal(false)}
        title="Kirim Suntingan?"
        description="Periksa sekali lagi jika perlu sebelum mengirim suntingan Anda."
        cancelLabel="Periksa Ulang"
        confirmLabel={isSaving ? "Mengirim..." : "Kirim"}
        onConfirm={handleConfirmSaveDraft}
        confirmClassName="bg-blue-600 hover:bg-blue-700"
        cancelDisabled={isSaving}
        confirmDisabled={isSaving}
      />

      <SuccessStatusModal
        show={showSaveSuccessModal}
        onClose={() => setShowSaveSuccessModal(false)}
        title="Suntingan Terkirim"
        description="Terima kasih sudah berkontribusi. Anda bisa mempublikasikan suntingan Anda dengan menekan tombol Terbitkan."
        primaryLabel="OK"
        onPrimary={() => setShowSaveSuccessModal(false)}
      />

      <ConfirmActionModal
        show={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        title="Terbitkan Artikel?"
        description="Artikel yang sudah diterbitkan akan langsung dapat dilihat oleh publik. Pastikan semua informasi sudah benar."
        cancelLabel="Batal"
        confirmLabel={isPublishing ? "Menerbitkan..." : "Terbitkan"}
        onConfirm={handleConfirmPublish}
        confirmClassName="bg-green-600 hover:bg-green-700"
        cancelDisabled={isPublishing}
        confirmDisabled={isPublishing}
      />

      <SuccessStatusModal
        show={showPublishSuccessModal}
        onClose={() => setShowPublishSuccessModal(false)}
        title="Artikel Berhasil Diterbitkan"
        description="Artikel Anda telah berhasil diterbitkan dan sekarang dapat dilihat oleh publik."
        primaryLabel="Lihat Artikel"
        onPrimary={() => {
          window.location.href = `/articles/${savedArticleId}`;
        }}
        secondaryLabel="Tutup"
        onSecondary={() => setShowPublishSuccessModal(false)}
      />
    </>
  );
}
