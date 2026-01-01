// src/CityMap.jsx
import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leaflet'in default marker ikonu (Vite/CRA ile path sorununu çözmek için CDN'den alıyoruz)
const defaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function CityMap({ locations = [], onLocationClick }) {
  const center = [39.9334, 32.8597]; // Ankara

  return (
    <MapContainer
      center={center}
      zoom={10}
      style={{ width: "100%", height: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {locations.map((loc) => {
        const lat = Number(loc.latitude);
        const lon = Number(loc.longitude);
        if (isNaN(lat) || isNaN(lon)) return null;

        return (
          <Marker
            key={loc.id || loc._id || loc.district_name}
            position={[lat, lon]}
            icon={defaultIcon}
            eventHandlers={{
              click: () => {
                if (onLocationClick) onLocationClick(loc);
              },
            }}
          >
            <Popup>
              <div style={{ fontSize: 13 }}>
                <strong>{loc.district_name || loc.name}</strong>
                <br />
                Urban score: {loc.urban_score}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
