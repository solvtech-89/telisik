import React from "react";

export default function DropdownItem({ icon, label, onClick, isActive }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
        isActive
          ? "bg-gray-100 font-medium text-gray-800"
          : "bg-transparent font-normal text-gray-600 hover:bg-gray-50"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
