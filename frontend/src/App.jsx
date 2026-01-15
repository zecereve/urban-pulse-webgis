// src/App.jsx
import React, { useState, useEffect } from "react";
import LoginPage from "./LoginPage";
import CityMap from "./CityMap";
import AdminDashboard from "./AdminDashboard"; // Updated component
import DistrictRadarChart from "./DistrictRadarChart";
import RecommendationWizard from "./RecommendationWizard";
import IssueModal from "./IssueModal";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { LayoutDashboard, Map as MapIcon, BarChart3, Users, Wind, Activity } from 'lucide-react';

const API_BASE = "";

/* ------------ GENEL LAYOUT (SIDEBAR + HEADER) ------------ */
function Layout({ user, onLogout, children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        background: "#0f172a",
        overflow: "hidden",
      }}
    >
      {/* SOL SİDEBAR */}
      <aside
        style={{
          width: 240,
          background:
            "radial-gradient(circle at top left, #1d4ed8 0, #020617 55%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          padding: "20px 16px",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 0.4,
            }}
          >
            Urban Pulse
          </div>
          <p
            style={{
              fontSize: 12,
              color: "rgba(248,250,252,0.7)",
              marginTop: 4,
            }}
          >
            Smart city insights
          </p>
        </div>

        <div
          style={{
            padding: 12,
            borderRadius: 12,
            background: "rgba(15,23,42,0.6)",
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 13, marginBottom: 4 }}>Giriş yapan</p>
          <p style={{ fontSize: 14, fontWeight: 600 }}>{user.email}</p>
          <p style={{ fontSize: 12, color: "rgba(248,250,252,0.7)" }}>
            Rol: {user.role}
          </p>
        </div>

        <div style={{ marginTop: "auto" }}>
          <button
            onClick={onLogout}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 999,
              border: "1px solid rgba(248,250,252,0.25)",
              background: "transparent",
              color: "white",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Çıkış yap
          </button>
        </div>
      </aside>

      {/* SAĞ ANA ALAN */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background:
            "radial-gradient(circle at top, #1e293b 0, #020617 55%, #020617 100%)",
        }}
      >
        {/* ÜST BAR */}
        <header
          style={{
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            borderBottom: "1px solid rgba(148,163,184,0.25)",
            color: "#e5e7eb",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 500 }}>Dashboard</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>
            {new Date().toLocaleString("tr-TR")}
          </div>
        </header>

        {/* İÇERİK */}
        <main
          style={{
            flex: 1,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            overflow: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

/* ----------------- CITIZEN DASHBOARD ----------------- */
function CitizenDashboard({ user }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [comparing, setComparing] = useState(null);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [issues, setIssues] = useState([]);
  const [issueMode, setIssueMode] = useState(false);
  const [newIssueLoc, setNewIssueLoc] = useState(null); // {lat, lng}
  const [showIssueModal, setShowIssueModal] = useState(false);

  useEffect(() => {
    async function fetchLocations() {
      try {
        setError("");
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/urban/locations?_t=${Date.now()}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Veri alınamadı.");
        } else {
          setLocations(data);
        }
      } catch (_err) {
        setError("Sunucuya bağlanırken hata oluştu.");
      } finally {
        setLoading(false);
      }
    }
    const fetchIssues = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/issues?_t=${Date.now()}`);
        if (res.ok) setIssues(await res.json());
      } catch (e) { console.error(e); }
    };

    fetchLocations();
    fetchIssues();
  }, []);

  const totals = locations.reduce(
    (acc, loc) => {
      const u = Number(loc.urban_score);
      const a = Number(loc.air_quality);
      const t = Number(loc.traffic_intensity);
      const p = Number(loc.population);
      if (!isNaN(u)) acc.urbanSum += u;
      if (!isNaN(a)) acc.airSum += a;
      if (!isNaN(t)) acc.trafficSum += t;
      if (!isNaN(p)) acc.populationSum += p;
      acc.count += 1;
      return acc;
    },
    { urbanSum: 0, airSum: 0, trafficSum: 0, populationSum: 0, count: 0 }
  );

  const avgUrban =
    totals.count > 0 ? (totals.urbanSum / totals.count).toFixed(2) : "-";
  const avgAir =
    totals.count > 0 ? (totals.airSum / totals.count).toFixed(2) : "-";
  const avgTraffic =
    totals.count > 0 ? (totals.trafficSum / totals.count).toFixed(2) : "-";
  const totalPopulation =
    totals.populationSum > 0
      ? totals.populationSum.toLocaleString("tr-TR")
      : "-";

  function yorumForScore(score) {
    const s = Number(score);
    if (isNaN(s)) return "Veri yok.";
    if (s >= 8) return "Yaşanabilirlik: çok yüksek.";
    if (s >= 6) return "Yaşanabilirlik: yüksek.";
    if (s >= 4) return "Yaşanabilirlik: orta.";
    if (s >= 2) return "Yaşanabilirlik: düşük.";
    return "Yaşanabilirlik: çok düşük.";
  }

  function yorumColor(score) {
    const s = Number(score);
    if (isNaN(s)) return "#e5e7eb";
    if (s >= 8) return "#22c55e";
    if (s >= 6) return "#4ade80";
    if (s >= 4) return "#eab308";
    if (s >= 2) return "#f97316";
    return "#ef4444";
  }

  const cellLabelStyle = {
    padding: "4px 6px",
    borderBottom: "1px solid rgba(148,163,184,0.25)",
    color: "#9ca3af",
    width: "30%",
  };

  const cellValueStyle = {
    padding: "4px 6px",
    borderBottom: "1px solid rgba(148,163,184,0.25)",
  };

  const kpiCard = (label, value) => (
    <div
      style={{
        borderRadius: 14,
        padding: 14,
        background: "rgba(15,23,42,0.9)",
        border: "1px solid rgba(148,163,184,0.55)",
        color: "#e5e7eb",
      }}
    >
      <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 600 }}>{value}</p>
    </div>
  );

  return (
    <>
      {/* Citizen KPI Şeridi */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 14,
        }}
      >
        {kpiCard("Ortalama urban score", avgUrban)}
        {kpiCard("Ortalama hava kalitesi", avgAir)}
        {kpiCard("Ortalama trafik", avgTraffic)}
        {kpiCard("Toplam nüfus", totalPopulation)}
      </section>

      <div style={{ margin: '12px 0', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setShowWizard(true)}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none', padding: '8px 16px', borderRadius: 8, color: 'white',
            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          🧙‍♂️ Bana İlçe Öner
        </button>
        <button
          onClick={() => setIssueMode(!issueMode)}
          style={{
            background: issueMode ? '#ef4444' : '#f59e0b',
            marginLeft: 10,
            border: 'none', padding: '8px 16px', borderRadius: 8, color: 'white',
            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          📍 {issueMode ? 'Modu Kapat' : 'Sorun Bildir'}
        </button>
      </div>

      {showIssueModal && (
        <IssueModal
          latlng={newIssueLoc}
          districtId={newIssueLoc.districtId}
          onClose={() => setShowIssueModal(false)}
          onSuccess={(newIssue) => {
            setIssues([newIssue, ...issues]);
            setShowIssueModal(false);
          }}
        />
      )}

      {showWizard && (
        <RecommendationWizard
          locations={locations}
          onClose={() => setShowWizard(false)}
          onSelect={(loc) => {
            setSelected(loc);
            setComparing(null);
            setIsCompareMode(false);
          }}
        />
      )}

      {/* Harita + alt tablo (Yan Yana / Split View) */}
      <section
        style={{
          flex: 1,
          display: "flex",
          gap: 16,
          marginTop: 10,
          minHeight: 0,
        }}
      >
        {/* SOL: Harita */}
        <div
          style={{
            flex: 2,
            borderRadius: 16,
            background: "#020617",
            border: "1px solid rgba(148,163,184,0.4)",
            padding: 8,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {loading ? (
            <p style={{ color: "#e5e7eb", padding: 8 }}>Veriler yükleniyor…</p>
          ) : error ? (
            <p style={{ color: "#f97316", padding: 8 }}>{error}</p>
          ) : (
            <div style={{ flex: 1, minHeight: 0 }}>
              <CityMap
                locations={locations}
                issues={issues}
                issueMode={issueMode}
                onMapClick={(latlng) => {
                  // Find which district contains this point
                  // Simple point-in-polygon check or usage of leafleet layer association if possible
                  // Since we have locations with polygons, we can iterate
                  let foundDistrictId = null;

                  // Helper for Ray Casting algorithm
                  const isPointInPoly = (point, vs) => {
                    const x = point.lat, y = point.lng;
                    let inside = false;
                    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                      const xi = vs[i][1], yi = vs[i][0]; // GeoJSON is [lng, lat] usually, but Leaflet might have swapped. 
                      // Let's assume GeoJSON standard [lng, lat]. 
                      // Wait, our data from seeding might look different.
                      // Let's inspect data format in console or assume [lng, lat] as per standard.

                      // Actually, a simpler way since we are in CityMap context:
                      // We can rely on user clicking THE POLYGON vs THE MAP BACKGROUND.
                      // But onMapClick fires on map container.
                      // For now, let's try to pass the district if the user clicked on a layer?
                      // No, the event is global.
                    }
                    return inside;
                  };

                  // To avoid complex geometry math here, let's rely on backend spatial search OR 
                  // pass the district if the user clicked a layer. 
                  // In CityMap, we can capture click on Polygon.

                  // UPDATED STRATEGY: We will just save latlng here. 
                  // The actual "find district" logic is better handled by 'onLocationClick' if we want to report for a specific district.
                  // BUT, the requirement is "User clicks map to report issue".
                  // Let's assume for now we just pass lat/lng. 
                  // AND I will add a "Assign District" logic in the backend based on lat/lng if district_id is missing?
                  // Or better: Let's iterate locations here.

                  for (const loc of locations) {
                    if (loc.polygon && loc.polygon.coordinates && loc.polygon.coordinates[0]) {
                      // Simple check using ray casting
                      // Coordinates are usually [[[lng, lat], ...]] (Multipolygon or Polygon)
                      // Let's assume simplge Polygon: [[lng, lat]]
                      const poly = loc.polygon.coordinates[0];
                      // Implement basic Ray Casting
                      let inside = false;
                      const x = latlng.lng, y = latlng.lat;
                      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
                        const xi = poly[i][0], yi = poly[i][1];
                        const xj = poly[j][0], yj = poly[j][1];
                        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                        if (intersect) inside = !inside;
                      }
                      if (inside) {
                        foundDistrictId = loc._id;
                        break;
                      }
                    }
                  }

                  setNewIssueLoc({ ...latlng, districtId: foundDistrictId });
                  setShowIssueModal(true);
                  setIssueMode(false); // Turn off after click
                }}
                onLocationClick={(loc) => {
                  if (isCompareMode) {
                    if (selected && (selected._id === loc._id)) {
                      alert("Zaten bu ilçeyi seçtiniz. Kıyaslamak için farklı bir ilçe seçin.");
                    } else {
                      setComparing(loc);
                    }
                  } else {
                    setSelected(loc);
                    setComparing(null);
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* SAĞ: Seçili İlçe Detayı */}
        <div
          style={{
            flex: 1,
            borderRadius: 16,
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(148,163,184,0.5)",
            padding: 14,
            color: "#e5e7eb",
            overflow: "auto",
          }}
        >
          {!selected ? (
            <p style={{ fontSize: 13, color: "#9ca3af" }}>
              Haritadan bir ilçe seçerek detayları ve geri bildirim panelini
              görüntüleyebilirsin.
            </p>
          ) : isCompareMode && comparing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Karşılaştırma</h3>
                <button onClick={() => { setIsCompareMode(false); setComparing(null); }} style={{ padding: '4px 8px', fontSize: 12, borderRadius: 4, background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer' }}>Kapat</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {/* LEFT: Selected */}
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 8 }}>
                  <h4 style={{ color: '#60a5fa' }}>{selected.district_name || selected.name}</h4>
                  <DistrictRadarChart district={selected} />
                  <div style={{ marginTop: 8, fontSize: 12 }}>
                    <p>Score: <strong>{selected.urban_score}</strong></p>
                    <p>Hava: <strong>{selected.air_quality}</strong></p>
                    <p>Trafik: <strong>{selected.traffic_intensity}</strong></p>
                  </div>
                </div>

                {/* RIGHT: Comparing */}
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 8 }}>
                  <h4 style={{ color: '#facc15' }}>{comparing.district_name || comparing.name}</h4>
                  <DistrictRadarChart district={comparing} />
                  <div style={{ marginTop: 8, fontSize: 12 }}>
                    <p>Score: <strong>{comparing.urban_score}</strong></p>
                    <p>Hava: <strong>{comparing.air_quality}</strong></p>
                    <p>Trafik: <strong>{comparing.traffic_intensity}</strong></p>
                  </div>
                </div>
              </div>

              <div style={{ padding: 10, background: '#1e293b', borderRadius: 8, fontSize: 13 }}>
                <p>
                  <strong>Sonuç: </strong>
                  {Number(selected.urban_score) > Number(comparing.urban_score)
                    ? `${selected.district_name} yaşanabilirlik açısından daha yüksek puanlı.`
                    : Number(selected.urban_score) < Number(comparing.urban_score)
                      ? `${comparing.district_name} yaşanabilirlik açısından daha yüksek puanlı.`
                      : "İki ilçe benzer puanlara sahip."}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: 8 }}>
                <h3 style={{ fontSize: 18, margin: 0 }}>
                  {selected.district_name || selected.name} Verileri
                </h3>
                <button
                  onClick={() => { setIsCompareMode(true); }}
                  style={{
                    fontSize: 12,
                    padding: "6px 12px",
                    background: isCompareMode ? "#22c55e" : "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer"
                  }}
                >
                  {isCompareMode ? "Kıyaslanacak ilçeyi seç..." : "Kıyasla"}
                </button>
              </div>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                <tbody>
                  <tr>
                    <td style={cellLabelStyle}>Urban score</td>
                    <td style={cellValueStyle}>{selected.urban_score}</td>
                  </tr>
                  <tr>
                    <td style={cellLabelStyle}>Hava kalitesi</td>
                    <td style={cellValueStyle}>{selected.air_quality}</td>
                  </tr>
                  <tr>
                    <td style={cellLabelStyle}>Trafik yoğunluğu</td>
                    <td style={cellValueStyle}>
                      {selected.traffic_intensity}
                    </td>
                  </tr>
                  <tr>
                    <td style={cellLabelStyle}>Gürültü seviyesi</td>
                    <td style={cellValueStyle}>{selected.noise_level}</td>
                  </tr>
                  <tr>
                    <td style={cellLabelStyle}>Nüfus</td>
                    <td style={cellValueStyle}>
                      {selected.population &&
                        Number(selected.population).toLocaleString("tr-TR")}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div
                style={{
                  marginBottom: 16,
                  padding: 10,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.05)",
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: yorumColor(selected.urban_score) }}>
                  {yorumForScore(selected.urban_score)}
                </p>
              </div>

              {/* ANALİZ GRAFİĞİ */}
              <div style={{ marginBottom: 24, borderTop: "1px solid rgba(148,163,184,0.25)", paddingTop: 16 }}>
                <h4 style={{ fontSize: 15, marginBottom: 12 }}>Detaylı Analiz</h4>
                <DistrictRadarChart district={selected} />
              </div>

              {/* GERİ BİLDİRİM FORMU */}
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(148,163,184,0.25)" }}>
                <h4 style={{ fontSize: 15, marginBottom: 12 }}>Geri Bildirim Yap</h4>
                <FeedbackForm
                  districtId={selected._id}
                  onFeedbackSuccess={() => {
                    alert("Geri bildirim gönderildi!");
                    // Basitçe alert veriyoruz, idealde listeyi yenilemek gerekir ama
                    // DistrictFeedbacks içindeki useEffect(..., [districtId]) sadece id değişince çalışır.
                    // Şimdilik bu yeterli, kullanıcı başka ilçeye tıklayıp geri dönünce görür.
                  }}
                />
              </div>

              {/* DİĞER VATANDAŞ GÖRÜŞLERİ */}
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(148,163,184,0.25)" }}>
                <h4 style={{ fontSize: 15, marginBottom: 12 }}>Vatandaş Görüşleri</h4>
                <DistrictFeedbacks districtId={selected._id} />
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

/* ----------------- ANALYST DASHBOARD ----------------- */
function AnalystDashboard({ user }) {
  const [locations, setLocations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("dashboard"); // dashboard, map
  const [issues, setIssues] = useState([]);

  // Interactive Map State
  const [selected, setSelected] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  // Chart Data Preparation
  const topUrban = locations
    .sort((a, b) => Number(b.urban_score) - Number(a.urban_score))
    .slice(0, 5)
    .map(l => ({ name: l.district_name || l.name, score: Number(l.urban_score) }));

  const topPop = locations
    .sort((a, b) => Number(b.population) - Number(a.population))
    .slice(0, 5)
    .map(l => ({ name: l.district_name || l.name, pop: Number(l.population) }));

  useEffect(() => {
    async function fetchAll() {
      try {
        setError("");
        setLoading(true);
        const [locRes, statsRes, issuesRes] = await Promise.all([
          fetch(`${API_BASE}/api/urban/locations?_t=${Date.now()}`),
          fetch(`${API_BASE}/api/urban/stats`),
          fetch(`${API_BASE}/api/issues`),
        ]);
        const locData = await locRes.json();
        const statsData = await statsRes.json();
        const issuesData = await issuesRes.json();

        if (!locRes.ok) setError(locData.error || "Hata");
        else if (!statsRes.ok) setError(statsData.error || "Hata");
        else {
          setLocations(locData);
          setStats(statsData);
          setIssues(issuesData);
        }
      } catch (err) { setError("Sunucu hatası"); }
      finally { setLoading(false); }
    }
    fetchAll();
  }, []);

  async function handleLocationClick(loc) {
    setSelected(loc);
    setFeedbacks([]);
    setLoadingFeedbacks(true);
    try {
      const res = await fetch(`${API_BASE}/api/feedback/${loc._id}`);
      const data = await res.json();
      if (res.ok) setFeedbacks(data);
    } catch (err) { console.error(err); }
    finally { setLoadingFeedbacks(false); }
  }

  const kpiData = [
    { label: "Toplam İlçe", value: stats?.total_locations || 0, icon: MapIcon, color: "#3b82f6" },
    { label: "Ort. Yaşam Puanı", value: Number(stats?.avg_urban_score || 0).toFixed(1), icon: Activity, color: "#10b981" },
    { label: "Ort. Hava Kalitesi", value: Number(stats?.avg_air_quality || 0).toFixed(1), icon: Wind, color: "#f59e0b" },
    { label: "Toplam Nüfus", value: Number(stats?.total_population || 0).toLocaleString("tr-TR"), icon: Users, color: "#8b5cf6" },
  ];

  if (loading) return <div style={{ color: "white", padding: 20 }}>Yükleniyor...</div>;

  return (
    <div style={{ height: "100%", overflowY: "auto", paddingRight: 8 }}>
      {/* Header & Toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: "bold", color: "white", margin: 0 }}>Analist Paneli</h2>
          <p style={{ color: "#94a3b8", fontSize: 13 }}>Şehir verilerini detaylı inceleyin.</p>
        </div>
        <div style={{ background: "#1e293b", borderRadius: 8, padding: 4, display: "flex", gap: 4 }}>
          <button
            onClick={() => setViewMode("dashboard")}
            style={{
              padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
              background: viewMode === "dashboard" ? "#3b82f6" : "transparent",
              color: viewMode === "dashboard" ? "white" : "#94a3b8"
            }}
          >
            <LayoutDashboard size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
            Panel
          </button>
          <button
            onClick={() => setViewMode("map")}
            style={{
              padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
              background: viewMode === "map" ? "#3b82f6" : "transparent",
              color: viewMode === "map" ? "white" : "#94a3b8"
            }}
          >
            <MapIcon size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
            Harita
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {kpiData.map((k, i) => (
          <div key={i} style={{ background: "#1e293b", padding: 16, borderRadius: 12, border: "1px solid #334155", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ padding: 10, background: `${k.color}20`, borderRadius: 10, color: k.color }}>
              <k.icon size={24} />
            </div>
            <div>
              <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 2 }}>{k.label}</p>
              <p style={{ fontSize: 20, fontWeight: "bold", color: "white", margin: 0 }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {viewMode === "dashboard" ? (
        <>
          {/* Charts Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div style={{ background: "#1e293b", padding: 20, borderRadius: 12, border: "1px solid #334155" }}>
              <h3 style={{ color: "white", fontSize: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <Activity size={18} color="#10b981" /> En Yaşanabilir 5 İlçe
              </h3>
              <div style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topUrban} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" domain={[0, 10]} hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }} />
                    <Bar dataKey="score" fill="#10b981" radius={[0, 4, 4, 0]}>
                      {topUrban.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"][index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: "#1e293b", padding: 20, borderRadius: 12, border: "1px solid #334155" }}>
              <h3 style={{ color: "white", fontSize: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <Users size={18} color="#8b5cf6" /> En Kalabalık 5 İlçe
              </h3>
              <div style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topPop} margin={{ bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} angle={-30} textAnchor="end" />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }} formatter={(value) => value.toLocaleString("tr-TR")} />
                    <Bar dataKey="pop" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #334155" }}>
              <h3 style={{ color: "white", fontSize: 16, margin: 0 }}>Tüm İlçe Verileri</h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, color: "#e2e8f0" }}>
                <thead>
                  <tr style={{ background: "#0f172a", textAlign: "left" }}>
                    <th style={{ padding: 12, fontWeight: 600, color: "#94a3b8" }}>İlçe Adı</th>
                    <th style={{ padding: 12, fontWeight: 600, color: "#94a3b8" }}>Nüfus</th>
                    <th style={{ padding: 12, fontWeight: 600, color: "#94a3b8" }}>Urban Score</th>
                    <th style={{ padding: 12, fontWeight: 600, color: "#94a3b8" }}>Hava (AQI)</th>
                    <th style={{ padding: 12, fontWeight: 600, color: "#94a3b8" }}>Trafik</th>
                    <th style={{ padding: 12, fontWeight: 600, color: "#94a3b8" }}>Gürültü (dB)</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((loc, i) => (
                    <tr key={loc._id} style={{ borderBottom: "1px solid #334155", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                      <td style={{ padding: 12, fontWeight: 500 }}>{loc.district_name || loc.name}</td>
                      <td style={{ padding: 12 }}>{Number(loc.population).toLocaleString("tr-TR")}</td>
                      <td style={{ padding: 12 }}>
                        <span style={{
                          padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600,
                          background: Number(loc.urban_score) >= 8 ? "rgba(16, 185, 129, 0.2)" : Number(loc.urban_score) >= 6 ? "rgba(245, 158, 11, 0.2)" : "rgba(239, 68, 68, 0.2)",
                          color: Number(loc.urban_score) >= 8 ? "#34d399" : Number(loc.urban_score) >= 6 ? "#fbbf24" : "#f87171"
                        }}>
                          {loc.urban_score}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>{loc.air_quality}</td>
                      <td style={{ padding: 12 }}>{loc.traffic_intensity}</td>
                      <td style={{ padding: 12 }}>{loc.noise_level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Map View - Split Layout */
        <div style={{ display: "flex", gap: 16, height: 600 }}>
          {/* Map Area */}
          <div style={{ flex: 2, background: "#020617", borderRadius: 16, overflow: "hidden", border: "1px solid #334155" }}>
            <CityMap locations={locations} issues={issues} onLocationClick={handleLocationClick} />
          </div>

          {/* Detail Panel */}
          <div style={{ flex: 1, background: "#1e293b", borderRadius: 16, border: "1px solid #334155", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {selected ? (
              <>
                <div style={{ padding: 20, borderBottom: "1px solid #334155" }}>
                  <h3 style={{ margin: 0, color: "white", fontSize: 20 }}>{selected.district_name || selected.name}</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                    <div>
                      <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 2 }}>Urban Score</p>
                      <p style={{ fontSize: 16, fontWeight: "bold", color: "#10b981" }}>{selected.urban_score}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 2 }}>Hava Kalitesi</p>
                      <p style={{ fontSize: 16, fontWeight: "bold", color: "#f59e0b" }}>{selected.air_quality}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 2 }}>Trafik</p>
                      <p style={{ fontSize: 16, fontWeight: "bold", color: "#ef4444" }}>{selected.traffic_intensity}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 2 }}>Gürültü</p>
                      <p style={{ fontSize: 16, fontWeight: "bold", color: "#e2e8f0" }}>{selected.noise_level} dB</p>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
                  {/* Issues Section */}
                  <h4 style={{ color: "white", fontSize: 14, marginBottom: 12 }}>Bölgedeki Sorun Bildirimleri</h4>
                  {issues.filter(i => i.district_id === selected._id || i.district_id === selected.id).length === 0 ? (
                    <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>Bu bölgede henüz sorun bildirilmemiş.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                      {issues.filter(i => i.district_id === selected._id || i.district_id === selected.id)
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .map(issue => (
                          <div key={issue._id} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", padding: 12, borderRadius: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                              <span style={{ color: "#f87171", fontSize: 13, fontWeight: "bold" }}>⚠ {issue.type}</span>
                              <span style={{ color: "#fda4af", fontSize: 11 }}>{new Date(issue.createdAt).toLocaleDateString("tr-TR")}</span>
                            </div>
                            {issue.imageUrl && (
                              <img src={`${API_BASE}${issue.imageUrl}`} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 6, marginBottom: 8 }} />
                            )}
                            <p style={{ color: "#fecaca", fontSize: 13, margin: 0, lineHeight: 1.4 }}>{issue.description}</p>
                            <div style={{ marginTop: 8, fontSize: 11, background: "#00000040", padding: "4px 8px", borderRadius: 4, display: "inline-block", color: "#fca5a5" }}>
                              Durum: {issue.status === "open" ? "Açık" : "Çözüldü"}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  <h4 style={{ color: "white", fontSize: 14, marginBottom: 12, borderTop: "1px solid #334155", paddingTop: 16 }}>Vatandaş Yorumları</h4>
                  {loadingFeedbacks ? (
                    <p style={{ color: "#94a3b8", fontSize: 13 }}>Yükleniyor...</p>
                  ) : feedbacks.length === 0 ? (
                    <p style={{ color: "#94a3b8", fontSize: 13 }}>Henüz yorum yapılmamış.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {feedbacks.map(f => (
                        <div key={f._id} style={{ background: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ color: "#fbbf24", fontSize: 13, fontWeight: "bold" }}>★ {f.rating}</span>
                            <span style={{ color: "#64748b", fontSize: 11 }}>{new Date(f.createdAt).toLocaleDateString("tr-TR")}</span>
                          </div>
                          {f.imageUrl && (
                            <img src={`${API_BASE}${f.imageUrl}`} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 6, marginBottom: 8 }} />
                          )}
                          <p style={{ color: "#e2e8f0", fontSize: 13, margin: 0, lineHeight: 1.4 }}>{f.comment || <i>Yorum yok</i>}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ padding: 20, textAlign: "center", color: "#94a3b8", marginTop: 40 }}>
                <MapIcon size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                <p>Detayları görmek için haritadan bir ilçe seçin.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------- FEEDBACK COMPONENTS ----------------- */

function FeedbackForm({ districtId, onFeedbackSuccess }) {
  const [rating, setRating] = useState(10);
  const [comment, setComment] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!districtId) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("district_id", districtId);
      formData.append("rating", rating);
      formData.append("comment", comment);
      if (file) {
        formData.append("image", file);
      }

      const res = await fetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setComment("");
        setFile(null);
        setRating(10);
        if (onFeedbackSuccess) onFeedbackSuccess();
      } else {
        alert("Hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      alert("Sunucu hatası.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div>
        <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 4 }}>Puan (1-10)</label>
        <input
          type="number"
          min="1"
          max="10"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #4b5563", background: "#1e293b", color: "white" }}
        />
      </div>
      <div>
        <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 4 }}>Yorum</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #4b5563", background: "#1e293b", color: "white", fontFamily: "inherit" }}
        />
      </div>
      <div>
        <label style={{ fontSize: 12, color: "#9ca3af", display: "block", marginBottom: 4 }}>Fotoğraf Yükle</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ fontSize: 13, color: "#e5e7eb" }}
        />
      </div>
      <button
        type="submit"
        disabled={uploading}
        style={{
          marginTop: 8,
          padding: "8px 12px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontWeight: 600
        }}
      >
        {uploading ? "Gönderiliyor..." : "Gönder"}
      </button>
    </form>
  );
}

function DistrictFeedbacks({ districtId }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!districtId) return;
    async function load() {
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
    }
    load();
  }, [districtId]);

  if (loading) return <p style={{ fontSize: 12, color: "#9ca3af" }}>Yükleniyor...</p>;
  if (feedbacks.length === 0) return <p style={{ fontSize: 12, color: "#6b7280" }}>Henüz yorum yapılmamış.</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {feedbacks.map(f => (
        <div key={f._id} style={{ background: "rgba(255,255,255,0.05)", padding: 10, borderRadius: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24" }}>★ {f.rating}</span>
            <span style={{ fontSize: 10, color: "#6b7280" }}>{new Date(f.createdAt).toLocaleDateString()}</span>
          </div>
          {f.imageUrl && (
            <img src={`${API_BASE}${f.imageUrl}`} alt="Görsel" style={{ width: "100%", borderRadius: 6, marginBottom: 6, objectFit: "cover", maxHeight: 200 }} />
          )}
          {f.comment && <p style={{ fontSize: 12, margin: 0, color: "#e5e7eb" }}>{f.comment}</p>}
        </div>
      ))}
    </div>
  );
}

/* ----------------- ROOT APP ----------------- */

export default function App() {
  const [user, setUser] = useState(null);

  function handleLogout() {
    setUser(null);
  }

  if (!user) {
    return <LoginPage onLoginSuccess={setUser} />;
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      {user.role === "citizen" && <CitizenDashboard user={user} />}
      {user.role === "analyst" && <AnalystDashboard user={user} />}
      {user.role === "admin" && <AdminDashboard user={user} />}
      {!["citizen", "analyst", "admin"].includes(user.role) && (
        <p style={{ color: "white" }}>Bilinmeyen rol: {user.role}</p>
      )}
    </Layout>
  );
}
