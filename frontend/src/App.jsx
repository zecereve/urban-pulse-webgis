// src/App.jsx
import React, { useState, useEffect } from "react";
import LoginPage from "./LoginPage";
import CityMap from "./CityMap";
import AdminDashboard from "./AdminDashboard"; // Admin için ayrı dosyan varsa kullan; yoksa bu satırı sonra düzenlersin

const API_BASE = "http://localhost:5050";

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

  useEffect(() => {
    async function fetchLocations() {
      try {
        setError("");
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/urban/locations`);
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
    fetchLocations();
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

      {/* Harita + alt tablo */}
      <section
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          marginTop: 10,
          minHeight: 0,
          gap: 10,
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 420,
            borderRadius: 16,
            background: "#020617",
            border: "1px solid rgba(148,163,184,0.4)",
            padding: 8,
            overflow: "hidden",
          }}
        >
          {loading ? (
            <p style={{ color: "#e5e7eb", padding: 8 }}>Veriler yükleniyor…</p>
          ) : error ? (
            <p style={{ color: "#f97316", padding: 8 }}>{error}</p>
          ) : (
            <CityMap locations={locations} onLocationClick={setSelected} />
          )}
        </div>

        <div
          style={{
            borderRadius: 16,
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(148,163,184,0.5)",
            padding: 14,
            color: "#e5e7eb",
          }}
        >
          {!selected ? (
            <p style={{ fontSize: 13, color: "#9ca3af" }}>
              Bir ilçeye tıkladığında burada tablo şeklinde tüm verileri ve
              yaşanabilirlik yorumunu göreceksin.
            </p>
          ) : (
            <>
              <h3 style={{ marginBottom: 8, fontSize: 16 }}>
                {selected.district_name || selected.name} için veriler
              </h3>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                  marginBottom: 8,
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
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  marginTop: 6,
                  color: yorumColor(selected.urban_score),
                }}
              >
                {yorumForScore(selected.urban_score)}
              </p>
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

  useEffect(() => {
    async function fetchAll() {
      try {
        setError("");
        setLoading(true);
        const [locRes, statsRes] = await Promise.all([
          fetch(`${API_BASE}/api/urban/locations`),
          fetch(`${API_BASE}/api/urban/stats`),
        ]);
        const locData = await locRes.json();
        const statsData = await statsRes.json();
        if (!locRes.ok) {
          setError(locData.error || "Lokasyonlar alınamadı.");
        } else if (!statsRes.ok) {
          setError(statsData.error || "İstatistikler alınamadı.");
        } else {
          setLocations(locData);
          setStats(statsData);
        }
      } catch (_err) {
        setError("Sunucuya bağlanırken hata oluştu.");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const cardStyle = {
    borderRadius: 14,
    padding: 14,
    background: "rgba(15,23,42,0.9)",
    border: "1px solid rgba(148,163,184,0.55)",
    color: "#e5e7eb",
  };

  const cardValue = {
    fontSize: 20,
    fontWeight: 600,
    marginTop: 6,
  };

  // urban_score'a göre top/bottom 3
  const sortedByUrban = [...locations].sort(
    (a, b) => Number(b.urban_score) - Number(a.urban_score)
  );
  const best3 = sortedByUrban.slice(0, 3);
  const worst3 = sortedByUrban.slice(-3).reverse();

  return (
    <>
      {/* Analyst KPI Şeridi */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 14,
        }}
      >
        <div style={cardStyle}>
          <p style={{ fontSize: 12, color: "#9ca3af" }}>Toplam lokasyon</p>
          <p style={cardValue}>{stats ? stats.total_locations : "-"}</p>
        </div>
        <div style={cardStyle}>
          <p style={{ fontSize: 12, color: "#9ca3af" }}>Ortalama urban score</p>
          <p style={cardValue}>
            {stats ? Number(stats.avg_urban_score).toFixed(2) : "-"}
          </p>
        </div>
        <div style={cardStyle}>
          <p style={{ fontSize: 12, color: "#9ca3af" }}>
            Ortalama hava kalitesi
          </p>
          <p style={cardValue}>
            {stats ? Number(stats.avg_air_quality).toFixed(2) : "-"}
          </p>
        </div>
        <div style={cardStyle}>
          <p style={{ fontSize: 12, color: "#9ca3af" }}>Toplam nüfus</p>
          <p style={cardValue}>
            {stats
              ? Number(stats.total_population).toLocaleString("tr-TR")
              : "-"}
          </p>
        </div>
      </section>

      {/* Harita + top/bottom tablo */}
      <section
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 12,
          marginTop: 10,
          minHeight: 0,
        }}
      >
        <div
          style={{
            borderRadius: 16,
            background: "#020617",
            border: "1px solid rgba(148,163,184,0.4)",
            padding: 8,
            overflow: "hidden",
          }}
        >
          {loading ? (
            <p style={{ color: "#e5e7eb", padding: 8 }}>Veriler yükleniyor…</p>
          ) : error ? (
            <p style={{ color: "#f97316", padding: 8 }}>{error}</p>
          ) : (
            <CityMap locations={locations} />
          )}
        </div>

        <div
          style={{
            borderRadius: 16,
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(148,163,184,0.5)",
            padding: 12,
            color: "#e5e7eb",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div>
            <h3 style={{ fontSize: 14, marginBottom: 4 }}>En yüksek 3 ilçe</h3>
            <ul style={{ fontSize: 12, paddingLeft: 16, margin: 0 }}>
              {best3.map((l) => (
                <li key={l.id || l._id}>
                  {l.district_name || l.name}:{" "}
                  {Number(l.urban_score).toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: 14, marginBottom: 4 }}>En düşük 3 ilçe</h3>
            <ul style={{ fontSize: 12, paddingLeft: 16, margin: 0 }}>
              {worst3.map((l) => (
                <li key={l.id || l._id}>
                  {l.district_name || l.name}:{" "}
                  {Number(l.urban_score).toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
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
