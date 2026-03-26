import React from "react";

export default function KredoBox({ heading = "", lead = "", body = "" }) {
  if (!heading && !lead) return null;

  return (
    <div className="bg-gradient-to-br from-telisik/5 to-telisik/10 border-2 border-telisik/20 rounded-lg p-6 my-6">
      {heading && (
        <h2 className="text-2xl md:text-3xl font-bold text-telisik mb-3">
          {heading}
        </h2>
      )}

      {lead && (
        <p className="text-lg text-neutral-800 mb-4 leading-relaxed">
          {lead}
        </p>
      )}

      {body && <div className="text-neutral-700 space-y-3">{body}</div>}

      {!heading && !lead ? (
        <div className="text-center py-4 text-neutral-500">
          <p className="text-sm italic">Kredo section not available</p>
        </div>
      ) : null}
    </div>
  );
}
