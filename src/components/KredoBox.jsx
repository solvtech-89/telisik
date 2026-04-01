import React from "react";

export default function KredoBox({ heading = "", lead = "", body = "" }) {
  if (!heading && !lead) return null;

  return (
    <section className="kredo-shell mt-0 mb-2 rounded-2xl bg-transparent px-1 py-2 md:mt-1 md:mb-2">
      {heading && (
        <h2 className="kredo-heading mb-2 max-w-5xl text-[1.85rem] font-extrabold leading-[1.2] tracking-[-0.02em] text-[#2f3a4f] md:text-[2.5rem] md:leading-[1.2]">
          {heading}
        </h2>
      )}

      {lead && (
        <p className="kredo-lead mb-2 max-w-6xl text-[1rem] font-medium leading-[1.65] text-[#f26532] md:text-[1.05rem]">
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
