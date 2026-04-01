import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Input } from "./ui";

export default function LocationManager({ locationData, setLocationData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchAlert, setSearchAlert] = useState({ type: "", message: "" });
  const [mapCenter] = useState([-6.2088, 106.8456]); // Jakarta coordinates [lat, lon]
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("location-map", {
        scrollWheelZoom: false,
      }).setView(mapCenter, 11);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current);

      mapRef.current.on("click", (e) => {
        handleMapClick(e.latlng);
      });
    }

    if (locationData && !markerRef.current) {
      const latlng = L.latLng(
        locationData.coordinates[1],
        locationData.coordinates[0],
      );
      addMarker(latlng, locationData.name);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  const addMarker = (latlng, name = "") => {
    if (markerRef.current) {
      mapRef.current.removeLayer(markerRef.current);
    }

    markerRef.current = L.marker(latlng, {
      draggable: true,
    }).addTo(mapRef.current);

    markerRef.current.on("dragend", async (e) => {
      const position = e.target.getLatLng();
      await reverseGeocode(position);
    });

    setLocationData({
      type: "Point",
      coordinates: [latlng.lng, latlng.lat],
      name: name || `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`,
    });
    setSearchAlert({ type: "", message: "" });
  };

  const handleMapClick = async (latlng) => {
    await reverseGeocode(latlng);
  };

  const reverseGeocode = async (latlng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`,
      );
      const data = await response.json();
      const locationName =
        data.display_name ||
        `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
      addMarker(latlng, locationName);
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      addMarker(latlng);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const latlng = L.latLng(parseFloat(result.lat), parseFloat(result.lon));

        mapRef.current.setView(latlng, 13);

        addMarker(latlng, result.display_name);
      } else {
        setSearchAlert({
          type: "warning",
          message: "Lokasi tidak ditemukan. Coba kata kunci lain.",
        });
      }
    } catch (error) {
      console.error("Error searching location:", error);
      setSearchAlert({
        type: "danger",
        message: "Gagal mencari lokasi. Silakan coba lagi.",
      });
    }
  };

  const handleClear = () => {
    if (markerRef.current) {
      mapRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    setLocationData(null);
    setSearchQuery("");
    setSearchAlert({ type: "", message: "" });
    mapRef.current.setView(mapCenter, 11);
  };

  return (
    <div className="editor-side-card editor-location-card mb-4">
      <h3 className="mb-4 text-xl font-semibold text-red-500">Lokasi</h3>

      <Alert
        type={searchAlert.type}
        message={searchAlert.message}
        onClose={() => setSearchAlert({ type: "", message: "" })}
      />

      <div className="mb-3">
        <label className="mb-1 block text-xs text-gray-500">Cari Lokasi</label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Cari alamat, kota, atau koordinat..."
            className="text-sm"
          />
          <Button type="button" size="sm" onClick={handleSearch}>
            Cari
          </Button>
        </div>
        <small className="mt-1 block text-[11px] text-gray-500">
          Atau klik langsung di peta untuk menandai lokasi
        </small>
      </div>

      <div
        id="location-map"
        className="mb-3 h-[240px] overflow-hidden rounded-md border border-gray-200"
      />

      {locationData && (
        <div className="rounded-md border border-green-300 bg-green-50 p-3 text-[13px]">
          <div className="mb-1 font-semibold text-green-800">
            ✓ Lokasi Tersimpan
          </div>
          <div className="mb-1 text-green-700">{locationData.name}</div>
          <div className="text-[11px] text-green-700">
            {locationData.coordinates[1].toFixed(6)},{" "}
            {locationData.coordinates[0].toFixed(6)}
          </div>
          <Button
            type="button"
            size="sm"
            variant="danger"
            className="mt-2 px-2 py-1 text-xs"
            onClick={handleClear}
          >
            Hapus Lokasi
          </Button>
        </div>
      )}
    </div>
  );
}
