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
          background: "rgba(15,23,42,0.9)",
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
          background: "rgba(15,23,42,0.9)",
          color: "white",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          maxWidth: 420,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Lokasyon Detayı</h3>
          <button
            onClick={() => setSelected({ isNew: true })}
            style={{ fontSize: 12, padding: "4px 8px", background: "#16a34a", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
          >
            + Yeni Ekle
          </button>
        </div>

        {error && (
          <p style={{ color: "#b91c1c", fontSize: 13, marginBottom: 8 }}>
            {error}
          </p>
        )}

        {!selected ? (
          <p style={{ fontSize: 13, color: "#6b7280" }}>
            Haritada bir ilçeye tıklayarak düzenlemeye başlayabilirsin.
          </p>
        ) : selected.isNew ? (
          <NewLocationForm
            onCancel={() => setSelected(null)}
            onSuccess={(newLoc) => {
              setLocations([...locations, newLoc]);
              setSelected(newLoc);
            }}
          />
        ) : (
          <>
            <div
              style={{
                marginBottom: 12,
                padding: 8,
                borderRadius: 8,
                background: "rgba(30, 41, 59, 0.8)",
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

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    backgroundColor: "#2563eb",
                    color: "white",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm("Bu lokasyonu silmek istediğine emin misin?")) return;
                    try {
                      const res = await fetch(`${API_BASE}/api/locations/${selected._id}`, { method: "DELETE" });
                      if (res.ok) {
                        setLocations(locations.filter(l => l._id !== selected._id));
                        setSelected(null);
                      } else {
                        alert("Silinemedi.");
                      }
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  style={{
                    padding: "10px 12px",
                    backgroundColor: "#dc2626",
                    color: "white",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Sil
                </button>
              </div>
            </form>
          </>
        )}

        {/* Geri Bildirim Moderasyonu */}
        {selected && !selected.isNew && (
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <h4 style={{ marginBottom: 12 }}>Geri Bildirimler</h4>
            <AdminFeedbackList districtId={selected._id} />
          </div>
        )}
      </div>
    </div>
  );
}

function NewLocationForm({ onCancel, onSuccess }) {
  const [name, setName] = React.useState("");
  const [lat, setLat] = React.useState("");
  const [lng, setLng] = React.useState("");
  const [pop, setPop] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, lat, lng, population: pop })
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess(data);
      } else {
        alert(data.error || "Hata");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h4 style={{ marginBottom: 12 }}>Yeni Lokasyon Ekle</h4>
      <LabelInput label="İlçe Adı" value={name} onChange={setName} />
      <div style={{ display: "flex", gap: 8 }}>
        <LabelInput label="Enlem (Lat)" value={lat} onChange={setLat} />
        <LabelInput label="Boylam (Lng)" value={lng} onChange={setLng} />
      </div>
      <LabelInput label="Nüfus" value={pop} onChange={setPop} />

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button type="button" onClick={onCancel} style={{ padding: "8px", flex: 1, background: "#4b5563", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>İptal</button>
        <button type="submit" disabled={loading} style={{ padding: "8px", flex: 1, background: "#16a34a", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>{loading ? "Ekleniyor..." : "Ekle"}</button>
      </div>
    </form>
  );
}

function AdminFeedbackList({ districtId }) {
  const [feedbacks, setFeedbacks] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const loadFeedbacks = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/feedback/${districtId}`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [districtId]);

  React.useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks]);

  async function updateStatus(id, status) {
    if (!window.confirm(`Durumu '${status}' olarak değiştirmek istediğine emin misin?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/feedback/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        loadFeedbacks();
      } else {
        alert("Hata oluştu.");
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) return <p style={{ fontSize: 12 }}>Yükleniyor...</p>;
  if (feedbacks.length === 0) return <p style={{ fontSize: 12, color: "#9ca3af" }}>Geri bildirim yok.</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {feedbacks.map(f => (
        <div key={f._id} style={{ background: "rgba(0,0,0,0.2)", padding: 10, borderRadius: 6, borderLeft: f.status === "harmful" ? "4px solid red" : f.status === "useful" ? "4px solid green" : "4px solid grey" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>
            <span>Puan: {f.rating}</span>
            <span>{new Date(f.createdAt).toLocaleDateString()}</span>
          </div>
          {f.imageUrl && <img src={`${API_BASE}${f.imageUrl}`} alt="img" style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4, marginBottom: 4 }} />}
          <p style={{ fontSize: 12, margin: 0 }}>{f.comment}</p>
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button onClick={() => updateStatus(f._id, "useful")} style={{ fontSize: 10, padding: "4px 8px", background: "#166534", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>Yararlı</button>
            <button onClick={() => updateStatus(f._id, "harmful")} style={{ fontSize: 10, padding: "4px 8px", background: "#991b1b", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>Zararlı</button>
          </div>
        </div>
      ))}
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
        type={label.includes("Lat") || label.includes("Lng") ? "number" : "text"}
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
