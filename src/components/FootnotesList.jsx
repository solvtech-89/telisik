import React from "react";

export default function FootnotesList({ footnotes }) {
  return (
    <div>
      <h2 className="mb-2 mt-6 text-2xl font-semibold text-telisik">
        Catatan Kaki
      </h2>
      {footnotes.length > 0 ? (
        <div className="footnotes-section mt-3 border-t border-gray-300 pt-3">
          <h6 className="mb-2 text-sm text-gray-500">
            Catatan Kaki
          </h6>
          {footnotes.map((footnote) => (
            <div key={footnote.id} className="footnote-item mb-1 text-sm">
              <span className="font-semibold">[{footnote.number}]</span>{" "}
              {footnote.content}
            </div>
          ))}
        </div>
      ) : (
        <p className="min-h-[200px] cursor-pointer italic text-gray-400">
          (Tidak ada catatan kaki)
        </p>
      )}
    </div>
  );
}
