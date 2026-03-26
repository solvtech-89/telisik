import React from "react";
import { Input } from "./ui";

export default function ResensiFields({
  bookTitle,
  setBookTitle,
  bookAuthor,
  setBookAuthor,
  bookPublisher,
  setBookPublisher,
  bookYear,
  setBookYear,
}) {
  return (
    <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <h6 className="mb-3 text-sm font-semibold text-gray-700">
        Detail Buku
      </h6>

      <div className="mb-3">
        <Input
          type="text"
          label="Judul Buku *"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
          placeholder="Masukkan judul buku"
        />
      </div>

      <div className="mb-3">
        <Input
          type="text"
          label="Penulis *"
          value={bookAuthor}
          onChange={(e) => setBookAuthor(e.target.value)}
          placeholder="Masukkan nama penulis"
        />
      </div>

      <div className="mb-3">
        <Input
          type="text"
          label="Penerbit *"
          value={bookPublisher}
          onChange={(e) => setBookPublisher(e.target.value)}
          placeholder="Masukkan nama penerbit"
        />
      </div>

      <div className="mb-3">
        <Input
          type="text"
          label="Tahun Terbit *"
          value={bookYear}
          onChange={(e) => setBookYear(e.target.value)}
          placeholder="Contoh: 2024"
          maxLength="4"
        />
      </div>
    </div>
  );
}
