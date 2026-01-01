// src/AdminDashboard.jsx
import React from "react";
import CityMap from "./CityMap";

const API_BASE = "http://localhost:5050";

export default function AdminDashboard({ user }) {
  const [locations, setLocations] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const [airQuality, setAirQuality] = React.useState("");
  const [traffic, setTraffic] = React.useState("");
  const [noise, setNoise] = React.useState("");
  const [urbanScore, setUrbanScore] = React.useState("");

  React.useEffect(() => {
    loadLocations();
  }, []);

  async function loadLocations() {
    try {
      setError("");
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/urban/locations`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Lokasyonlar alınamadı.");
      } else {
        setLocations(data);
      }
    } catch (err) {
      setError("Sunucuya bağlanırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  function handleLocationClick(loc) {
    setSelected(loc);
    setAirQuality(loc.air_quality ?? "");
    setTraffic(loc.traffic_intensity ?? "");
    setNoise(loc.noise_level ?? "");
    setUrbanScore(loc.urban_score ?? "");
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!selected) return;

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/locations/${selected._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          air_quality: airQuality,
          traffic_intensity: traffic,
          noise_level: noise,
          urban_score: urbanScore,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Lokasyon güncellenemedi.");
      } else {
        await loadLocations();
        setSelected(data);
      }
    } catch (err) {
      setError("Sunucuya bağlanırken hata oluştu.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ flex: 1, display: "flex", gap: 16 }}>
      {/* Sol: Harita */}
      <div
        style={{
          flex: 2,
          background: "white",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            marginBottom: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <div>
            <h2 style={{ marginBottom: 4 }}>Admin Panel</h2>
            <p style={{ fontSize: 13, color: "#6b7280" }}>
              Hoş geldin, {user.email} (Rol: {user.role})
            </p>
          </div>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            Lokasyonlara tıklayarak düzenleyebilirsin.
          </span>
        </div>

        {loading ? (
          <p>Lokasyonlar yükleniyor...</p>
        ) : (
          <div style={{ flex: 1 }}>
            <CityMap
              locations={locations}
              onLocationClick={handleLocationClick}
            />
          </div>
        )}
      </div>

      {/* Sağ: Seçili lokasyon bilgisi + form */}
      <div
        style={{
          flex: 1,
          background: "white",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          maxWidth: 420,
        }}
      >
        <h3 style={{ marginBottom: 8 }}>Lokasyon Detayı</h3>
        {error && (
          <p style={{ color: "#b91c1c", fontSize: 13, marginBottom: 8 }}>
            {error}
          </p>
        )}

        {!selected ? (
          <p style={{ fontSize: 13, color: "#6b7280" }}>
            Haritada bir ilçeye tıklayarak düzenlemeye başlayabilirsin.
          </p>
        ) : (
          <>
            <div
              style={{
                marginBottom: 12,
                padding: 8,
                borderRadius: 8,
                background: "#f9fafb",
                fontSize: 13,
              }}
            >
              <div>
                <strong>Ad:</strong> {selected.name || selected.district}
              </div>
              <div>
                <strong>ID:</strong> {selected._id}
              </div>
            </div>

            <form onSubmit={handleSave}>
              <LabelInput
                label="Hava Kalitesi"
                value={airQuality}
                onChange={setAirQuality}
              />
              <LabelInput
                label="Trafik Yoğunluğu"
                value={traffic}
                onChange={setTraffic}
              />
              <LabelInput
                label="Gürültü Seviyesi"
                value={noise}
                onChange={setNoise}
              />
              <LabelInput
                label="Urban Score"
                value={urbanScore}
                onChange={setUrbanScore}
              />

              <button
                type="submit"
                disabled={saving}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#2563eb",
                  color: "white",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function LabelInput({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <label
        style={{
          display: "block",
          fontSize: 13,
          marginBottom: 4,
        }}
      >
        {label}
      </label>
      <input
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: 8,
          border: "1px solid #d1d5db",
          fontSize: 14,
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}
