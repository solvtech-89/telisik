import React from "react";
import { ICONS } from "../config";

export default function LeftNav({ items = [], collapsed = false, onToggle }) {
  return (
    <>
      <div className="flex justify-end">
        <button
          className="px-2 py-1 text-sm bg-telisik text-white rounded"
          onClick={onToggle}
        >
          {collapsed ? ">" : "<"}
        </button>
      </div>

      <div className="p-2 overflow-y-auto h-full">
        {collapsed ? (
          <div className="flex flex-col gap-2 items-center">
            {Object.keys(ICONS).map((k) => (
              <div key={k} dangerouslySetInnerHTML={{ __html: ICONS[k] }} />
            ))}
          </div>
        ) : (
          <nav>
            <ul className="space-y-2">
              {items.map((it) => (
                <li key={it.id}>
                  <button
                    type="button"
                    className="flex items-center gap-2 text-left w-full p-0 text-gray-700 dark:text-gray-100 hover:text-telisik"
                    onClick={() => {
                      const target = document.getElementById(
                        `section-${it.key}`,
                      );
                      const middleCol =
                        document.getElementById("middle-col-scroll");
                      if (target && middleCol) {
                        middleCol.scrollTo({
                          top: target.offsetTop - 40, // adjust padding
                          behavior: "smooth",
                        });
                      }
                    }}
                  >
                    <span
                      className="mr-2"
                      key={it.key}
                      dangerouslySetInnerHTML={{
                        __html: ICONS[it.key?.replace("-", "_")] || ICONS.h1,
                      }}
                    />
                    <span>{it.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </>
  );
}
