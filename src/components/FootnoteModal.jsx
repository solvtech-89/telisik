import React from "react";
import { Button, Modal } from "./ui";

export default function FootnoteModal({
  show,
  value,
  onChange,
  onClose,
  onSubmit,
}) {
  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Tambah Catatan Kaki"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={onSubmit}>
            Tambah
          </Button>
        </>
      }
    >
      <textarea
        className="w-full rounded border border-gray-300 p-2"
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Masukkan isi catatan kaki..."
        autoFocus
      />
    </Modal>
  );
}
