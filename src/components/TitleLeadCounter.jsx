import React from "react";

export default function TitleLeadCounter({ current, max }) {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  const isWarning = percentage >= 90;
  const isError = current > max;

  return (
    <span
      className={`absolute right-3 top-3 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-xs font-semibold ${
        isError ? "text-red-600" : isWarning ? "text-amber-500" : "text-gray-400"
      }`}
    >
      {current}/{max}
    </span>
  );
}
