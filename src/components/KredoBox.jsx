import React from "react";

export default function KredoBox({ heading = "", lead = "", body = "" }) {
  if (!heading && !lead) return null;

  return (
    <section className="kredo-shell mt-0 mb-2 rounded-2xl bg-transparent px-0 py-2 md:mt-1 md:mb-2">
      {heading && (
        <h1
          className="kredo-heading mb-2 w-full max-w-none font-extrabold text-[#555333]"
          style={{
            fontSize: "clamp(1.9rem, 3.2vw, 3rem)",
            lineHeight: 1.04,
            letterSpacing: "-0.02em",
          }}
        >
          {heading}
        </h1>
      )}

      {lead && (
        <p className="kredo-lead mb-2 max-w-6xl text-[1.125rem] font-semibold leading-[1.3334] text-[#f26532] md:text-[1.375rem] md:leading-[1.2728]">
          {lead}
        </p>
      )}

      {body && (
        <div className="kredo-body max-w-6xl space-y-2 text-neutral-700">
          {body}
        </div>
      )}

      {!heading && !lead ? (
        <div className="text-center py-4 text-neutral-500">
          <p className="text-sm italic">Kredo section not available</p>
        </div>
      ) : null}
    </section>
  );
}
