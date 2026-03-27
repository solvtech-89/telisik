import React from "react";

export default function FootnotesList({ footnotes }) {
  return (
    <div className="mt-6">
      <h2 className="mb-2 mt-6 text-2xl font-semibold text-telisik">
        Catatan Kaki
      </h2>
      {footnotes.length > 0 ? (
        <div className="footnotes-section mt-3 rounded-md border border-gray-200 bg-white p-4">
          {footnotes.map((footnote) => (
            <div
              key={footnote.id}
              className="footnote-item mb-2 text-sm leading-relaxed last:mb-0"
            >
              <span className="font-semibold">[{footnote.number}]</span>{" "}
              {footnote.content}
            </div>
          ))}
        </div>
      ) : (
        <p className="min-h-[120px] cursor-pointer rounded-md border border-dashed border-gray-300 bg-white px-4 py-4 italic text-gray-400">
          (Tidak ada catatan kaki)
        </p>
      )}
    </div>
  );
}
