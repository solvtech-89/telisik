import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icon issue in Leaflet when bundled
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function ArticleLocationMap({ location }) {
  if (!location?.geometry?.coordinates) return null;

  const [lon, lat] = location.geometry.coordinates;
  const position = [lat, lon];

  return (
    <div className="mb-3">
      <h5 className="font-bold mb-2 h3">LOKASI</h5>
      <div
        style={{
          height: "300px",
          overflow: "hidden",
        }}
      >
        <MapContainer
          center={position}
          zoom={11}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeoJSON data={location} />
          <Marker position={position}>
            <Popup>{location.properties?.city || "Lokasi Artikel"}</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
