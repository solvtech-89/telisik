import React from "react";

export default function Input({
  label,
  error,
  errorMessage,
  hint,
  icon,
  iconPosition = "left",
  fullWidth = true,
  className = "",
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? "w-full" : ""}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-danger-600 ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && iconPosition === "left" && (
          <span className="absolute left-3 text-gray-500 flex items-center pointer-events-none">
            {icon}
          </span>
        )}

        <input
          className={`
            w-full px-3 py-2 text-sm
            border-2 rounded-lg
            transition-colors duration-200
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${error ? "border-danger-300 focus:border-danger-600 focus:ring-danger-100" : "border-gray-300 focus:border-telisik focus:ring-telisik/10"}
            ${icon && iconPosition === "left" ? "pl-10" : ""}
            ${icon && iconPosition === "right" ? "pr-10" : ""}
            disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60
            ${className}
          `}
          {...props}
        />

        {icon && iconPosition === "right" && (
          <span className="absolute right-3 text-gray-500 flex items-center pointer-events-none">
            {icon}
          </span>
        )}
      </div>

      {error && errorMessage && (
        <span className="text-xs text-danger-600">{errorMessage}</span>
      )}

      {hint && !error && <span className="text-xs text-gray-500">{hint}</span>}
    </div>
  );
}
