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
  const observerRef = useRef(null);
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

  const mapInfoText =
    "Konflik sosial, yang selanjutnya disebut Konflik, adalah perseteruan dan/atau benturan fisik dengan kekerasan antara dua kelompok masyarakat atau lebih yang berlangsung dalam waktu tertentu dan berdampak luas yang mengakibatkan ketidakamanan dan disintegrasi sosial sehingga mengganggu stabilitas nasional dan menghambat pembangunan nasional. (UU No. 7/2012 tentang Penanganan Konflik Sosial)";

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
      circle.setAttribute(
        "class",
        "custom-marker cursor-pointer hover:opacity-80 transition-opacity",
      );
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
          observerRef.current = observer;
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

      if (observerRef.current) {
        try {
          observerRef.current.disconnect();
        } catch (e) {}
        observerRef.current = null;
      }

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
      const targetColor = activeCategories.size > 0 ? "#c8c4b7" : "#D8D4C9";
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
        home-map-shell overflow-hidden rounded-xl border border-[#ddd9ce] bg-[#F0FDFF] shadow-[0_2px_8px_rgba(30,41,59,0.06)]
        ${isFullscreen ? "fixed inset-0 rounded-none border-none z-50" : ""}
      `}
    >
      {/* Map Container */}
      <div className="home-map-stage relative h-[320px] w-full bg-[#F0FDFF] sm:h-[360px] lg:h-[430px]">
        <div ref={mapRef} className="w-full h-full" />

        {/* Map Controls */}
        <div className="home-map-controls absolute right-4 top-4 z-10 inline-flex overflow-hidden rounded-[2px] border border-[#d3cfbf] bg-[#f8f8f7] shadow-[0_1px_2px_rgba(15,23,42,0.08)]">
          <button
            onClick={handleZoom(false)}
            className="home-map-control-btn grid h-12 w-12 place-items-center text-[#7b828f] transition hover:bg-[#f2f3f4]"
            title="Zoom out"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35"
              />
              <circle cx="11" cy="11" r="6.5" strokeWidth={2} />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.5 11h5"
              />
            </svg>
          </button>

          <button
            onClick={handleZoom(true)}
            className="home-map-control-btn grid h-12 w-12 place-items-center border-l border-[#d3cfbf] text-[#7b828f] transition hover:bg-[#f2f3f4]"
            title="Zoom in"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35"
              />
              <circle cx="11" cy="11" r="6.5" strokeWidth={2} />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 8.5v5"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.5 11h5"
              />
            </svg>
          </button>

          <button
            onClick={handleFullscreen}
            className="home-map-control-btn grid h-12 w-12 place-items-center border-l border-[#d3cfbf] text-[#7b828f] transition hover:bg-[#f2f3f4]"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <svg
                className="h-5 w-5"
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
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5h11v11"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16L19 5"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Category Legend */}
      <div className="home-map-legend border-t border-[#dfddd4] px-6 py-4">
        <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
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
                flex items-center gap-2 rounded-md px-1 py-1 text-sm leading-none transition-colors
                ${
                  activeCategories.has(cat.key)
                    ? "text-[#2f3a4f]"
                    : "text-[#8f8b79] hover:text-[#565e6f]"
                }
              `}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={
                  activeCategories.has(cat.key) ? "opacity-100" : "opacity-80"
                }
                style={{
                  color: activeCategories.has(cat.key)
                    ? categoryColors[cat.key]
                    : "#8f8b79",
                }}
              >
                <path
                  d="M1.1 1.2L14.8 14.9"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <path
                  d="M3.6 6.6C4.2 5.7 5.6 4 8 4C10.4 4 11.8 5.7 12.4 6.6"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <path
                  d="M6.2 9.3C6.6 9.7 7.2 10 8 10C9.7 10 11 8.7 11 7"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <path
                  d="M3.1 9.4C3.9 10.4 5.4 12 8 12C9.3 12 10.4 11.6 11.2 11"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-[0.62rem] font-medium uppercase tracking-[0.03em] sm:text-[0.7rem]">
                {cat.label}
              </span>
            </button>
          ))}
        </div>

        <p className="home-map-info mt-3 text-[0.78rem] italic leading-[1.45] text-[#5f6980] sm:text-[0.84rem]">
          {mapInfoText}
        </p>
      </div>
    </div>
  );
}
