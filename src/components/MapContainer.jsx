import React, { useRef, useEffect, useCallback, useState } from "react";
import jsVectorMap from "jsvectormap";
import "jsvectormap/dist/jsvectormap.css";

export default function MapContainer({
  markers = [],
  activeCategories = new Set(),
  onCategoryToggle,
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const mapSectionRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const customMarkersRef = useRef([]);

  // Remove @tabler/core - use Tailwind instead
  const categoryColors = {
    AGRARIA: "#D84315",
    EKOSOSPOL: "#1976D2",
    SUMBER_DAYA_ALAM: "#388E3C",
  };

  const updateCustomMarkers = useCallback(() => {
    const map = mapInstance.current;
    if (!map || !mapReady) return;

    customMarkersRef.current.forEach((circle) => {
      const lat = parseFloat(circle.getAttribute("data-lat"));
      const lng = parseFloat(circle.getAttribute("data-lng"));
      const point = map.coordsToPoint(lat, lng);

      circle.setAttribute("cx", point.x);
      circle.setAttribute("cy", point.y);
    });
  }, [mapReady]);

  const renderCustomMarkers = useCallback(() => {
    const map = mapInstance.current;
    if (!map || !mapReady) return;

    customMarkersRef.current.forEach((el) => el.remove());
    customMarkersRef.current = [];

    if (activeCategories.size === 0 || markers.length === 0) return;

    const filtered = markers.filter((m) => activeCategories.has(m.category));
    const svg = map.container.querySelector("svg");
    if (!svg) return;

    filtered.forEach((m) => {
      const coords = [parseFloat(m.coords[0]), parseFloat(m.coords[1])];
      const point = map.coordsToPoint(coords[0], coords[1]);

      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      circle.setAttribute("cx", point.x);
      circle.setAttribute("cy", point.y);
      circle.setAttribute("r", "7");
      circle.setAttribute("fill", categoryColors[m.category] || "#666");
      circle.setAttribute("stroke", "white");
      circle.setAttribute("strokeWidth", "1.5");
      circle.setAttribute("class", "custom-marker cursor-pointer hover:opacity-80 transition-opacity");
      circle.setAttribute("data-lat", coords[0]);
      circle.setAttribute("data-lng", coords[1]);

      const title = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "title",
      );
      title.textContent = `${m.name} (${m.article_title})`;
      circle.appendChild(title);

      svg.appendChild(circle);
      customMarkersRef.current.push(circle);
    });
  }, [markers, activeCategories, mapReady, categoryColors]);

  // Initialize map
  useEffect(() => {
    let mounted = true;
    const createMap = () => {
      if (!mapRef.current || mapInstance.current) return;
      mapRef.current.innerHTML = "";

      const mapConfig = {
        selector: mapRef.current,
        map: "indonesia",
        backgroundColor: "transparent",
        regionStyle: {
          initial: {
            fill: "#D8D4C9",
            stroke: "#dadce0",
            strokeWidth: 0.5,
          },
        },
        zoomOnScroll: false,
        zoomButtons: false,
        draggable: true,
        markers: [],
      };

      mapInstance.current = new jsVectorMap(mapConfig);
      const map = mapInstance.current;

      const svg = map.container.querySelector("svg");
      if (svg) {
        const observer = new MutationObserver(() => {
          updateCustomMarkers();
        });

        const g = svg.querySelector("g");
        if (g) {
          observer.observe(g, {
            attributes: true,
            attributeFilter: ["transform"],
          });
        }
      }

      setMapReady(true);
    };

    if (!window.jsVectorMap?.maps?.indonesia) {
      const script = document.createElement("script");
      script.src = "/maps/jsvectormap.indonesia.js";
      script.async = true;
      script.onload = () => mounted && createMap();
      document.body.appendChild(script);
    } else {
      createMap();
    }

    return () => {
      mounted = false;
      customMarkersRef.current.forEach((el) => {
        try {
          el.remove();
        } catch (e) {}
      });
      customMarkersRef.current = [];

      if (mapInstance.current) {
        mapInstance.current = null;
      }

      if (mapRef.current) {
        mapRef.current.innerHTML = "";
      }
    };
  }, [updateCustomMarkers]);

  // Update map on category/fullscreen changes
  useEffect(() => {
    if (mapInstance.current && mapReady) {
      const timer = setTimeout(() => {
        mapInstance.current.updateSize();
        setTimeout(() => {
          renderCustomMarkers();
        }, 100);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isFullscreen, mapReady, renderCustomMarkers]);

  // Render markers when active categories change
  useEffect(() => {
    if (mapReady && mapInstance.current) {
      const targetColor =
        activeCategories.size > 0 ? "#878672" : "#E2E8F0";
      if (mapInstance.current.regions) {
        Object.keys(mapInstance.current.regions).forEach((code) => {
          const region = mapInstance.current.regions[code];
          if (region?.element?.node)
            region.element.node.style.fill = targetColor;
        });
      }
      renderCustomMarkers();
    }
  }, [mapReady, activeCategories, renderCustomMarkers]);

  // Fullscreen handlers
  const handleFullscreen = () => {
    const container = mapSectionRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) container.requestFullscreen();
      else if (container.webkitRequestFullscreen)
        container.webkitRequestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handler = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);

      if (mapInstance.current) {
        setTimeout(() => {
          mapInstance.current.updateSize();
          setTimeout(() => {
            renderCustomMarkers();
          }, 150);
        }, 150);
      }
    };

    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler);

    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
    };
  }, [renderCustomMarkers]);

  // Zoom handlers
  const handleZoom = (zoomIn = true) => {
    return () => {
      const map = mapInstance.current;
      if (!map) return;

      map._setScale(
        zoomIn
          ? map.scale * map.params.zoomStep
          : map.scale / map.params.zoomStep,
        map._width / 2,
        map._height / 2,
        false,
        map.params.zoomAnimate,
      );
    };
  };

  return (
    <div
      ref={mapSectionRef}
      className={`
        rounded-lg overflow-hidden border border-gray-200 shadow-sm
        ${isFullscreen ? "fixed inset-0 rounded-none border-none z-50" : ""}
      `}
    >
      {/* Map Container */}
      <div className="w-full h-96 md:h-full relative bg-gradient-to-br from-gray-50 to-gray-100">
        <div ref={mapRef} className="w-full h-full" />

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={handleZoom(false)}
            className="p-2 bg-white hover:bg-gray-50 rounded-lg shadow-md border border-gray-200 transition-colors"
            title="Zoom out"
          >
            <svg
              className="w-5 h-5 text-neutral-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </button>

          <button
            onClick={handleZoom(true)}
            className="p-2 bg-white hover:bg-gray-50 rounded-lg shadow-md border border-gray-200 transition-colors"
            title="Zoom in"
          >
            <svg
              className="w-5 h-5 text-neutral-600"
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
          </button>

          <button
            onClick={handleFullscreen}
            className="p-2 bg-white hover:bg-gray-50 rounded-lg shadow-md border border-gray-200 transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <svg
                className="w-5 h-5 text-neutral-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-neutral-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6v4m12 0h4v-4m0 12h-4v4m-12 0v-4H6"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Category Legend */}
      <div className="bg-white p-4 border-t border-gray-200">
        <p className="text-xs text-neutral-600 mb-3 font-medium">
          KATEGORI PETA
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "AGRARIA", label: "Agraria", color: "bg-red-500" },
            { key: "EKOSOSPOL", label: "Ekosospol", color: "bg-blue-500" },
            {
              key: "SUMBER_DAYA_ALAM",
              label: "Sumber Daya Alam",
              color: "bg-green-500",
            },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => onCategoryToggle(cat.key)}
              className={`
                flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium
                transition-colors
                ${
                  activeCategories.has(cat.key)
                    ? "bg-gray-100 text-neutral-900"
                    : "text-neutral-600 hover:bg-gray-50"
                }
              `}
            >
              <div className={`w-3 h-3 rounded-full ${cat.color}`} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
