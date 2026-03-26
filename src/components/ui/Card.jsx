import React from "react";

export default function Card({
  children,
  className = "",
  padding = "md",
  shadow = "md",
  hover = false,
  onClick,
}) {
  const paddingClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
    none: "p-0",
  };

  const shadowClasses = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg border border-gray-200
        ${paddingClasses[padding] || paddingClasses.md}
        ${shadowClasses[shadow] || shadowClasses.md}
        ${hover ? "hover:shadow-lg cursor-pointer transition-shadow" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
