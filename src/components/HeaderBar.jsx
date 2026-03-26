import { useState } from "react";

export default function HeaderBar({ title, collapsed, onToggle }) {
  return (
    <div className="bg-white border-b p-2 flex justify-between items-center">
      <div className="text-lg font-bold">{!collapsed && title}</div>
      <button
        className="px-2 py-1 text-sm border rounded text-gray-700 hover:bg-gray-100"
        onClick={onToggle}
      >
        {collapsed ? "Expand" : "Collapse"}
      </button>
    </div>
  );
}
