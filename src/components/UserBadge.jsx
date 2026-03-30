import React from "react";
import { ICONS } from "../config";

export default function UserBadge({
  name = "Display Name",
  avatar = "",
  time = "",
  size = 24,
  nameSize = "0.78rem",
  timeSize = "0.65rem",
  nameColor = "#1f2937",
  singleLine = false,
  className = "",
  layout = "inline", // 'inline' or 'stack'
  subtitle = "",
  subtitleSize = "0.75rem",
  subtitleColor = "#6b6b6b",
  username = "",
  usernameSize = "0.75rem",
  usernameColor = "#6b6b6b",
}) {
  const avatarStyle = avatar
    ? {
        backgroundImage: `url(${avatar})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "transparent",
      }
    : { backgroundColor: "#e9ecef" };

  if (layout === "stack") {
    return (
      <div className={`text-center ${className}`}>
        <div
          className="rounded-full mx-auto overflow-hidden"
          style={{ width: size, height: size, ...avatarStyle }}
        >
          {!avatar && (
            <div
              className="user-badge-fallback-icon"
              style={{
                width: size,
                height: size,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              dangerouslySetInnerHTML={{ __html: ICONS.user }}
            />
          )}
        </div>
        <div
          className="mt-2 font-semibold"
          style={{ fontSize: nameSize, color: nameColor }}
        >
          {name}
        </div>
        {subtitle ? (
          <div style={{ fontSize: subtitleSize, color: subtitleColor }}>
            {subtitle}
          </div>
        ) : time ? (
          <div style={{ fontSize: timeSize, color: "#9ca3af" }}>· {time}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`flex items-start ${className}`}>
      <div
        className="rounded-full mr-2 overflow-hidden flex-shrink-0"
        style={{ width: size, height: size, minWidth: size, ...avatarStyle }}
      >
        {!avatar && (
          <div
            className="user-badge-fallback-icon"
            style={{
              width: size,
              height: size,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            dangerouslySetInnerHTML={{ __html: ICONS.user }}
          />
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center">
          <span
            className="font-semibold"
            style={{
              fontSize: nameSize,
              color: nameColor,
              display: "inline-block",
              whiteSpace: singleLine ? "nowrap" : "normal",
            }}
          >
            {name}
          </span>

          {username ? (
            <span
              style={{
                fontSize: usernameSize,
                color: usernameColor,
                marginLeft: 6,
              }}
            >
              @{username}
            </span>
          ) : null}

          {time ? (
            <span className="text-gray-400 ml-2" style={{ fontSize: timeSize }}>
              · {time}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
