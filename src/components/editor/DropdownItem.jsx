import React from "react";

export default function DropdownItem({ icon, label, onClick, isActive }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        padding: "8px 12px",
        border: "none",
        background: isActive ? "#f3f4f6" : "transparent",
        cursor: "pointer",
        fontSize: "14px",
        textAlign: "left",
        color: isActive ? "#1f2937" : "#4b5563",
        fontWeight: isActive ? "500" : "400"
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = "#f9fafb";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}