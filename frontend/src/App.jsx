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
              <CityMap locations={locations} onLocationClick={setSelected} />
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
          ) : (
            <>
              <h3 style={{ marginBottom: 12, fontSize: 18, borderBottom: "1px solid rgba(148,163,184,0.25)", paddingBottom: 8 }}>
                {selected.district_name || selected.name} Verileri
              </h3>
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

  // Seçili ilçe ve onun geri bildirimleri
  const [selected, setSelected] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

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

  async function handleLocationClick(loc) {
    setSelected(loc);
    setFeedbacks([]);
    setLoadingFeedbacks(true);
    try {
      const res = await fetch(`${API_BASE}/api/feedback/${loc._id}`);
      const data = await res.json();
      if (res.ok) {
        setFeedbacks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFeedbacks(false);
    }
  }

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

  return (
    <>
      {/* KPI Şeridi */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
        <div style={cardStyle}>
          <p style={{ fontSize: 12, color: "#9ca3af" }}>Toplam lokasyon</p>
          <p style={cardValue}>{stats ? stats.total_locations : "-"}</p>
        </div>
        <div style={cardStyle}>
          <p style={{ fontSize: 12, color: "#9ca3af" }}>Ortalama urban score</p>
          <p style={cardValue}>{stats ? Number(stats.avg_urban_score).toFixed(2) : "-"}</p>
        </div>
        <div style={cardStyle}>
          <p style={{ fontSize: 12, color: "#9ca3af" }}>Ortalama hava kalitesi</p>
          <p style={cardValue}>{stats ? Number(stats.avg_air_quality).toFixed(2) : "-"}</p>
        </div>
        <div style={cardStyle}>
          <p style={{ fontSize: 12, color: "#9ca3af" }}>Toplam nüfus</p>
          <p style={cardValue}>{stats ? Number(stats.total_population).toLocaleString("tr-TR") : "-"}</p>
        </div>
      </section>

      {/* Harita + Detay (Yan Yana) */}
      <section style={{ flex: 1, display: "flex", gap: 16, marginTop: 10, minHeight: 0 }}>
        {/* SOL: Harita */}
        <div style={{ flex: 2, borderRadius: 16, background: "#020617", border: "1px solid rgba(148,163,184,0.4)", padding: 8, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {loading ? (
            <p style={{ color: "#e5e7eb", padding: 8 }}>Veriler yükleniyor…</p>
          ) : error ? (
            <p style={{ color: "#f97316", padding: 8 }}>{error}</p>
          ) : (
            <div style={{ flex: 1, minHeight: 0 }}>
              <CityMap locations={locations} onLocationClick={handleLocationClick} />
            </div>
          )}
        </div>

        {/* SAĞ: Özet ve Geri Bildirimler */}
        <div style={{ flex: 1, borderRadius: 16, background: "rgba(15,23,42,0.95)", border: "1px solid rgba(148,163,184,0.5)", padding: 14, color: "#e5e7eb", overflow: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {!selected ? (
            <div>
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>Genel Bakış</h3>
              <p style={{ fontSize: 13, color: "#9ca3af" }}>Haritadan bir ilçe seçerek vatandaş geri bildirimlerini ve detayları gör.</p>
            </div>
          ) : (
            <>
              <div>
                <h3 style={{ fontSize: 18, marginBottom: 4 }}>{selected.district_name || selected.name}</h3>
                <p style={{ fontSize: 13, color: "#9ca3af" }}>Urban Score: {selected.urban_score}</p>
              </div>

              <div>
                <h4 style={{ fontSize: 14, marginBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 4 }}>Vatandaş Bildirimleri</h4>
                {loadingFeedbacks ? (
                  <p style={{ fontSize: 12 }}>Yükleniyor...</p>
                ) : feedbacks.length === 0 ? (
                  <p style={{ fontSize: 12, color: "#6b7280" }}>Henüz geri bildirim yok.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {feedbacks.map(f => (
                      <div key={f._id} style={{ background: "rgba(255,255,255,0.05)", padding: 10, borderRadius: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24" }}>★ {f.rating}</span>
                          <span style={{ fontSize: 10, color: "#6b7280" }}>{new Date(f.createdAt).toLocaleDateString()}</span>
                        </div>
                        {f.imageUrl && (
                          <img src={`${API_BASE}${f.imageUrl}`} alt="Feedback" style={{ width: "100%", borderRadius: 6, marginBottom: 6, objectFit: "cover", maxHeight: 150 }} />
                        )}
                        {f.comment && <p style={{ fontSize: 12, margin: 0 }}>{f.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </>
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
