import React from "react";

export default function EditorHintBox({ children, className = "" }) {
  return (
    <div
      className={`flex items-start gap-3 rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 ${className}`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.44256 11.0933C3.76679 10.1845 2.62891 8.41003 2.62891 6.36976C2.62891 3.40412 5.03304 1 7.99868 1C10.9643 1 13.3685 3.40412 13.3685 6.36976C13.3685 8.41003 12.2306 10.1845 10.5548 11.0933"
          stroke="var(--s-labelText, #878672)"
        />
        <path
          d="M10.3137 13.8016L10.6992 11.1519H5.29688L5.7822 13.8481C5.90222 14.5149 6.48253 15.0001 7.16007 15.0001H8.92832C9.62367 15.0001 10.2136 14.4898 10.3137 13.8016Z"
          stroke="var(--s-labelText, #878672)"
        />
        <path
          d="M9.08764 11.3935V8.53552C9.08764 7.93314 8.59932 7.44482 7.99694 7.44482C7.39457 7.44482 6.90625 7.93314 6.90625 8.53552V11.3935"
          stroke="var(--s-labelText, #878672)"
        />
        <path
          d="M7.98438 3.32568V5.35377"
          stroke="var(--s-labelText, #878672)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
        <path
          d="M4.92969 5.35352L5.78483 6.04639"
          stroke="var(--s-labelText, #878672)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
        <path
          d="M11.1289 5.35352L10.2738 6.04639"
          stroke="var(--s-labelText, #878672)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
      </svg>
      <div className="italic">{children}</div>
    </div>
  );
}
