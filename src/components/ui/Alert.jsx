import React from "react";

const typeStyles = {
  info: "bg-blue-50 border-blue-200 text-blue-800",
  success: "bg-green-50 border-green-200 text-green-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  danger: "bg-red-50 border-red-200 text-red-800",
};

export default function Alert({
  type = "info",
  message,
  onClose,
  onRetry,
  title,
  className = "",
}) {
  if (!message) return null;

  return (
    <div
      className={`p-4 rounded-lg border border-l-4 flex justify-between items-start gap-3 ${typeStyles[type] || typeStyles.info} ${className}`}
      role="alert"
    >
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <p className="text-sm">{message}</p>
      </div>
      <div className="flex items-center gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            Retry
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
