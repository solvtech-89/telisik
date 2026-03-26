import React from "react";

const categoryConfig = {
  AGRARIA: { label: "Agraria", color: "from-red-500 to-red-600" },
  EKOSOSPOL: { label: "Ekosospol", color: "from-blue-500 to-blue-600" },
  SUMBER_DAYA_ALAM: { label: "Sumber Daya Alam", color: "from-green-500 to-green-600" },
};

export default function CategoryFilter({
  activeCategories,
  onCategoryToggle,
}) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-neutral-900 mb-3">
        Filter Kategori
      </h3>

      <div className="flex flex-wrap gap-2">
        {Object.entries(categoryConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => onCategoryToggle(key)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all
              ${
                activeCategories.has(key)
                  ? `bg-gradient-to-r ${config.color} text-white shadow-md`
                  : "bg-gray-100 text-neutral-700 hover:bg-gray-200"
              }
            `}
          >
            <span className="inline-flex items-center gap-2">
              {activeCategories.has(key) ? (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              )}
              {config.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
