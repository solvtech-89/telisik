import React from "react";
import { Modal, Button } from "./ui";

export default function ArticleEditModeModal({
  show,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      show={show}
      onClose={onCancel}
      title="Sila tanggapi/sunting"
      size="lg"
      className="bg-[#f5f1e8]"
      footer={[
        <Button
          key="cancel"
          variant="ghost"
          className="border border-red-600 text-red-600 hover:bg-red-50"
          onClick={onCancel}
        >
          Batalkan
        </Button>,
        <Button
          key="confirm"
          className="bg-[#6b7c5a] hover:bg-[#5f6f50] active:bg-[#516046]"
          onClick={onConfirm}
        >
          Saya Paham
        </Button>,
      ]}
    >
      <div className="space-y-3 text-sm text-neutral-700">
        <p>Klik tombol Tanggapi/Sunting di bawah paragraf sasaran.</p>
        <p className="italic text-neutral-500">
          Tiap paragraf maksimal 560 karakter termasuk spasi. Lebih dari itu,
          ketikan otomatis menjadi paragraf baru.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Hindari beropini: suntingan wajib faktual dan relevan.</li>
          <li>
            Dilarang memuat ujaran kebencian atau stereotipe suku, agama, ras,
            dan golongan (SARA).
          </li>
          <li>
            Terhadap <strong>suntingan</strong>: Redaksi Telisik dapat
            memperbaiki ejaan atau kalimat sebelum menerbitkan.
          </li>
          <li>
            Terhadap <strong>tanggapan</strong>: yang lolos moderasi akan
            dipublikasi apa adanya, tanpa suntingan.
          </li>
          <li>
            Sila baca{" "}
            <a
              href="/pages/terms-and-conditions"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Ketentuan Urun Daya Telisik
            </a>
            .
          </li>
        </ul>
      </div>
    </Modal>
  );
}