import React from "react";

export default function Skeleton({
  className = "",
  height = "h-4",
  width = "w-full",
  count = 1,
  circle = false,
  variant = "default",
}) {
  const skeletons = Array.from({ length: count });

  if (circle) {
    return (
      <div className="flex gap-2">
        {skeletons.map((_, i) => (
          <div
            key={i}
            className={`
              rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200
              animate-pulse
              ${height}
              ${width}
            `}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {skeletons.map((_, i) => (
        <div
          key={i}
          className={`
            bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200
            animate-pulse rounded-lg
            ${height}
            ${width}
          `}
        />
      ))}
    </div>
  );
}
