// src/CityMap.jsx
import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMapEvents,
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

// Helper to determine color based on urban_score (1-10)
function getColor(score) {
  if (!score) return "#2563eb"; // Default blue if no score
  if (score >= 8) return "#22c55e"; // Green (High livability)
  if (score >= 6) return "#eab308"; // Yellow (Medium)
  return "#ef4444"; // Red (Low)
}

export default function CityMap({ locations = [], onLocationClick, issueMode, onMapClick, issues = [], onIssueClick }) {
  const center = [39.9334, 32.8597]; // Ankara

  // E.g. red icon for issues
  const issueIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", // Use standard for now, but maybe color filter in CSS? 
    // Or finding a red marker URL
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Green icon for resolved issues
  const resolvedIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  function MapEvents() {
    const map = useMapEvents({
      click(e) {
        if (issueMode && onMapClick) {
          onMapClick(e.latlng);
        }
      },
    });
    return null;
  }

  return (
    <MapContainer
      center={center}
      zoom={10}
      style={{ width: "100%", height: "100%", cursor: issueMode ? "crosshair" : "grab" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents />

      {/* Existing District Markers/Polygons */}
      {!issueMode && locations.map((loc) => {
        const lat = Number(loc.latitude);
        const lon = Number(loc.longitude);
        if (isNaN(lat) || isNaN(lon)) return null;

        const baseColor = getColor(loc.urban_score);

        return (
          <React.Fragment key={loc.id || loc._id || loc.district_name}>
            <Marker
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
            {loc.polygon && (
              <GeoJSON
                data={loc.polygon}
                style={{
                  color: baseColor,
                  weight: 2,
                  opacity: 0.8,
                  fillOpacity: 0.2
                }}
                eventHandlers={{
                  click: () => {
                    if (onLocationClick) onLocationClick(loc);
                  },
                  mouseover: (e) => {
                    const layer = e.target;
                    layer.setStyle({
                      fillOpacity: 0.5,
                      weight: 4,
                      color: baseColor
                    });
                  },
                  mouseout: (e) => {
                    const layer = e.target;
                    layer.setStyle({
                      fillOpacity: 0.2,
                      weight: 2,
                      color: baseColor
                    });
                  }
                }}
              />
            )}
          </React.Fragment>
        );
      })}

      {/* Issue Markers */}
      {issues.map((issue) => (
        <Marker
          key={issue._id}
          position={[issue.latitude, issue.longitude]}
          icon={issue.status === "resolved" ? resolvedIcon : issueIcon}
          eventHandlers={{
            click: () => {
              if (onIssueClick) onIssueClick(issue);
            }
          }}
        >
          <Popup>
            <div style={{ fontSize: 13, minWidth: 150 }}>
              <strong>Sorun: {issue.type}</strong>
              <p style={{ margin: '4px 0', color: '#666' }}>{issue.description}</p>
              {issue.imageUrl && (
                <img src={`http://localhost:5050${issue.imageUrl}`} alt="Görsel" style={{ width: '100%', marginTop: 4, borderRadius: 4 }} />
              )}
              <div style={{ marginTop: 4, fontSize: 11, color: '#999' }}>
                Durum: {issue.status}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

    </MapContainer>
  );
}
