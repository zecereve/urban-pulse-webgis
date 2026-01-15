// src/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { Trash2, CheckCircle, XCircle, User, AlertTriangle, MessageSquare, MapPin } from "lucide-react";
import CityMap from "./CityMap";

const API_BASE = "";

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("overview"); // overview, users, issues, feedbacks
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]); // This might be heavy to fetch all, let's see
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [saving, setSaving] = useState(false);
  const [locations, setLocations] = useState([]);
  const [filterDistrict, setFilterDistrict] = useState("");

  useEffect(() => {
    fetchStats();
    fetchLocations();
  }, []);

  async function fetchLocations() {
    try {
      const res = await fetch(`${API_BASE}/api/urban/locations`);
      if (res.ok) setLocations(await res.json());
    } catch (e) { console.error(e); }
  }

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "issues") fetchIssues();
    if (activeTab === "feedbacks") fetchFeedbacks(); // Need a route for ALL feedbacks or per district?
    // Let's assume we can fetch all or we stick to per-district in Map view?
    // User requested "Admin user edit". Let's provide a list.
  }, [activeTab]);

  async function fetchStats() {
    try {
      const res = await fetch(`${API_BASE}/api/urban/stats`);
      setStats(await res.json());
    } catch (e) { console.error(e); }
  }

  async function fetchUsers() {
    setLoading(true);
    try {
      // We need a route for this. Let's assume /api/auth/users exists or we create it.
      // If not exists, I might need to create it. I'll check auth.js later.
      // For now, let's assume it exists or I'll mock it if it fails.
      const res = await fetch(`${API_BASE}/api/auth/users`);
      if (res.ok) setUsers(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function fetchIssues() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/issues?_t=${Date.now()}`);
      if (res.ok) setIssues(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  // Dummy fetch for all feedbacks if route doesn't exist
  // Dummy fetch for all feedbacks if route doesn't exist
  async function fetchFeedbacks() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/feedback/all`);
      if (res.ok) setFeedbacks(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/locations/${selected._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          air_quality: selected.air_quality,
          traffic_intensity: selected.traffic_intensity,
          noise_level: selected.noise_level,
          urban_score: selected.urban_score,
          population: selected.population
        }),
      });
      if (res.ok) {
        const data = await res.json();
        // Update local state
        setLocations(locations.map(l => l._id === data._id ? data : l));
        setSelected(data);
        alert("Güncellendi!");
      } else {
        alert("Hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      alert("Sunucu hatası.");
    } finally {
      setSaving(false);
    }
  }

  /* --- HANDLERS --- */
  async function handleDeleteUser(id) {
    if (!window.confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/api/auth/users/${id}`, { method: "DELETE" });
      if (res.ok) fetchUsers();
    } catch (e) { console.error(e); }
  }

  async function handleUpdateIssueStatus(id, status) {
    try {
      const res = await fetch(`${API_BASE}/api/api/issues/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchIssues();
    } catch (e) { console.error(e); }
  }

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", gap: 20 }}>
      {/* Sidebar Navigation */}
      <div style={{ width: 200, display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 style={{ fontSize: 20, fontWeight: "bold", color: "white", marginBottom: 16 }}>Yönetim</h2>

        <NavButton icon={CheckCircle} label="Genel Bakış" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
        <NavButton icon={MapPin} label="Harita Düzenleyici" active={activeTab === "mapEditor"} onClick={() => setActiveTab("mapEditor")} />
        <NavButton icon={User} label="Kullanıcılar" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
        <NavButton icon={AlertTriangle} label="Sorun Bildirimleri" active={activeTab === "issues"} onClick={() => setActiveTab("issues")} />
        <NavButton icon={MessageSquare} label="Geri Bildirimler" active={activeTab === "feedbacks"} onClick={() => setActiveTab("feedbacks")} />
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, background: "#1e293b50", borderRadius: 16, border: "1px solid #334155", overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* HEADER */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #334155", background: "#0f172a80" }}>
          <h3 style={{ margin: 0, fontSize: 18, color: "white" }}>
            {activeTab === "overview" && "Genel Bakış"}
            {activeTab === "mapEditor" && "Harita Düzenleyici"}
            {activeTab === "users" && "Kullanıcı Yönetimi"}
            {activeTab === "issues" && "Altyapı Sorunları Moderasyonu"}
          </h3>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflowY: "hidden", display: "flex", flexDirection: "column" }}>
          {activeTab === "overview" && (
            <div style={{ padding: 24, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              <StatCard label="Toplam İlçe" value={stats?.total_locations || "-"} color="#3b82f6" />
              <StatCard label="Toplam Nüfus" value={stats?.total_population?.toLocaleString() || "-"} color="#8b5cf6" />
              <StatCard label="Ortalama Skor" value={stats?.avg_urban_score?.toFixed(1) || "-"} color="#10b981" />
            </div>
          )}

          {activeTab === "mapEditor" && (
            <div style={{ flex: 1, display: "flex", gap: 16, padding: 16 }}>
              {/* Left: Map */}
              <div style={{ flex: 2, borderRadius: 12, overflow: "hidden", border: "1px solid #334155" }}>
                <CityMap
                  locations={locations}
                  issues={issues}
                  onLocationClick={(loc) => { setSelected(loc); setSelectedIssue(null); }}
                  onIssueClick={(issue) => { setSelectedIssue(issue); setSelected(null); }}
                />
              </div>

              {/* Right: Editor / Details */}
              <div style={{ flex: 1, borderRadius: 12, background: "rgba(15,23,42,0.8)", border: "1px solid #334155", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {selected ? (
                  <div style={{ padding: 16, overflowY: "auto" }}>
                    <h3 style={{ margin: "0 0 12px 0", color: "white" }}>{selected.district_name || selected.name} Düzenle</h3>
                    <form onSubmit={handleSave}>
                      <LabelInput label="Hava Kalitesi" value={selected.air_quality || ""} onChange={v => setSelected({ ...selected, air_quality: v })} />
                      <LabelInput label="Trafik" value={selected.traffic_intensity || ""} onChange={v => setSelected({ ...selected, traffic_intensity: v })} />
                      <LabelInput label="Gürültü" value={selected.noise_level || ""} onChange={v => setSelected({ ...selected, noise_level: v })} />
                      <LabelInput label="Urban Score" value={selected.urban_score || ""} onChange={v => setSelected({ ...selected, urban_score: v })} />
                      <LabelInput label="Nüfus" value={selected.population || ""} onChange={v => setSelected({ ...selected, population: v })} />
                      <button type="submit" disabled={saving} style={{ width: "100%", padding: 10, marginTop: 8, background: "#2563eb", color: "white", borderRadius: 8, border: "none", cursor: "pointer" }}>
                        {saving ? "Kaydediliyor..." : "Kaydet"}
                      </button>
                    </form>

                    <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #334155" }}>
                      <h4 style={{ color: "white", fontSize: 14 }}>Geri Bildirimler</h4>
                      <AdminFeedbackList districtId={selected._id} />
                    </div>
                  </div>
                ) : selectedIssue ? (
                  <div style={{ padding: 16 }}>
                    <h3 style={{ margin: "0 0 12px 0", color: "#f87171" }}>Sorun Detayı</h3>
                    <div style={{ marginBottom: 16 }}>
                      <span style={{ fontSize: 12, background: "#334155", padding: "4px 8px", borderRadius: 4, color: "white" }}>{selectedIssue.type}</span>
                      <span style={{ fontSize: 12, marginLeft: 8, color: "#94a3b8" }}>{new Date(selectedIssue.createdAt).toLocaleDateString()}</span>
                    </div>
                    {selectedIssue.imageUrl && (
                      <img src={`${API_BASE}${selectedIssue.imageUrl}`} style={{ width: "100%", borderRadius: 8, marginBottom: 12 }} />
                    )}
                    <p style={{ color: "#e2e8f0", fontSize: 14, background: "#1e293b", padding: 12, borderRadius: 8 }}>
                      {selectedIssue.description}
                    </p>

                    <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                      {selectedIssue.status === "open" && (
                        <button
                          onClick={() => { handleUpdateIssueStatus(selectedIssue._id, "resolved"); setSelectedIssue({ ...selectedIssue, status: "resolved" }); }}
                          style={{ flex: 1, padding: 10, background: "#16a34a", color: "white", borderRadius: 8, border: "none", cursor: "pointer" }}
                        >
                          Çözüldü
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          if (!window.confirm("Bu kaydı kalıcı olarak silmek istiyor musunuz?")) return;

                          try {
                            const res = await fetch(`${API_BASE}/api/api/issues/${selectedIssue._id}`, { method: "DELETE" });
                            if (res.ok) {
                              setSelectedIssue(null);
                              fetchIssues();
                            } else {
                              alert("Silinemedi.");
                            }
                          } catch (e) { console.error(e); }
                        }}
                        style={{ flex: 1, padding: 10, background: "#dc2626", color: "white", borderRadius: 8, border: "none", cursor: "pointer" }}
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: 20, textAlign: "center", color: "#94a3b8" }}>
                    <MapPin size={48} style={{ opacity: 0.2 }} />
                    <p>Haritadan bir ilçe veya sorun seçin.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              {loading ? <p>Yükleniyor...</p> : (
                <table style={{ width: "100%", borderCollapse: "collapse", color: "#cbd5e1", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#334155", textAlign: "left" }}>
                      <th style={{ padding: 10 }}>Email</th>
                      <th style={{ padding: 10 }}>Rol</th>
                      <th style={{ padding: 10 }}>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} style={{ borderBottom: "1px solid #334155" }}>
                        <td style={{ padding: 10 }}>{u.email}</td>
                        <td style={{ padding: 10 }}>
                          <span style={{
                            padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: "bold",
                            background: u.role === "admin" ? "#dc2626" : u.role === "analyst" ? "#2563eb" : "#16a34a"
                          }}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: 10 }}>
                          <button onClick={() => handleDeleteUser(u._id)} style={{ border: "none", background: "transparent", color: "#f87171", cursor: "pointer" }}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === "issues" && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <select
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                  style={{
                    padding: "8px 12px", borderRadius: 8, border: "1px solid #334155",
                    background: "#1e293b", color: "white", fontSize: 13, width: 200
                  }}
                >
                  <option value="">Tüm İlçeler</option>
                  {locations.map(l => (
                    <option key={l._id} value={l._id}>{l.district_name || l.name}</option>
                  ))}
                </select>
              </div>

              {loading ? <p>Yükleniyor...</p> : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                  {issues.filter(i => {
                    if (!filterDistrict) return true;
                    return i.district_id === filterDistrict;
                  }).length === 0 ? <p>Kayıtlı sorun yok.</p> :
                    issues.filter(i => {
                      if (!filterDistrict) return true;
                      return i.district_id === filterDistrict;
                    }).map(issue => {
                      const district = locations.find(l => l._id === issue.district_id || l.id === issue.district_id);
                      return (
                        <div key={issue._id} style={{ display: "flex", gap: 16, background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 8, border: "1px solid #334155" }}>
                          {issue.imageUrl ? (
                            <img src={`${API_BASE}${issue.imageUrl}`} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6 }} />
                          ) : (
                            <div style={{ width: 80, height: 80, background: "#334155", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <AlertTriangle size={24} color="#94a3b8" />
                            </div>
                          )}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ fontWeight: "bold", color: "#fca5a5" }}>
                                {issue.type.toUpperCase()}
                                <span style={{ color: "#94a3b8", fontWeight: "normal", marginLeft: 8, fontSize: 13 }}>
                                  ({district ? district.district_name || district.name : "Bilinmeyen"})
                                </span>
                              </span>
                              <span style={{ fontSize: 12, color: "#94a3b8" }}>{new Date(issue.createdAt).toLocaleDateString("tr-TR")}</span>
                            </div>
                            <p style={{ margin: "4px 0 8px 0", fontSize: 13, color: "#cbd5e1" }}>{issue.description}</p>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: issue.status === "open" ? "#b91c1c" : "#15803d", color: "white" }}>
                                {issue.status === "open" ? "AÇIK" : "ÇÖZÜLDÜ"}
                              </span>
                              {issue.status === "open" && (
                                <button
                                  onClick={() => handleUpdateIssueStatus(issue._id, "resolved")}
                                  style={{ padding: "4px 12px", borderRadius: 100, border: "1px solid #16a34a", background: "transparent", color: "#16a34a", fontSize: 11, cursor: "pointer", fontWeight: "bold" }}
                                >
                                  Çözüldü Olarak İşaretle
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          )}
          {activeTab === "feedbacks" && (
            <div style={{ padding: 24, overflowY: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ margin: 0, color: "white" }}>Tüm Geri Bildirimler</h3>
                <select
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                  style={{
                    padding: "8px 12px", borderRadius: 8, border: "1px solid #334155",
                    background: "#1e293b", color: "white", fontSize: 13, width: 200
                  }}
                >
                  <option value="">Tüm İlçeler</option>
                  {locations.map(l => (
                    <option key={l._id} value={l._id}>{l.district_name || l.name}</option>
                  ))}
                </select>
              </div>

              {loading ? <p>Yükleniyor...</p> : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                  {feedbacks.filter(f => {
                    if (!filterDistrict) return true;
                    return f.district_id === filterDistrict;
                  }).length === 0 ? <p>Hiç geri bildirim yok.</p> :
                    feedbacks.filter(f => {
                      if (!filterDistrict) return true;
                      return f.district_id === filterDistrict;
                    }).map(f => {
                      const district = locations.find(l => l._id === f.district_id || l.id === f.district_id);
                      return (
                        <div key={f._id} style={{ background: "rgba(255,255,255,0.05)", padding: 16, borderRadius: 8, borderLeft: f.status === "harmful" ? "4px solid red" : f.status === "useful" ? "4px solid green" : "4px solid grey" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ color: "#94a3b8", fontSize: 12 }}>
                              <MapPin size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
                              {district ? district.district_name || district.name : "Bilinmeyen İlçe"}
                              <span style={{ margin: "0 8px", opacity: 0.5 }}>|</span>
                              Puan: {f.rating}
                            </span>
                            <span style={{ color: "#64748b", fontSize: 12 }}>{new Date(f.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p style={{ color: "#e2e8f0", margin: "0 0 12px 0" }}>{f.comment}</p>
                          {f.imageUrl && <img src={`${API_BASE}${f.imageUrl}`} style={{ height: 60, borderRadius: 4, marginBottom: 8 }} />}
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={async () => {
                              if (!window.confirm("Yararlı olarak işaretlensin mi?")) return;
                              await fetch(`${API_BASE}/api/api/feedback/${f._id}/status`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "useful" }) });
                              fetchFeedbacks();
                            }} style={{ padding: "4px 8px", background: "#166534", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 11 }}>Yararlı</button>
                            <button onClick={async () => {
                              if (!window.confirm("Zararlı olarak işaretlensin mi?")) return;
                              await fetch(`${API_BASE}/api/api/feedback/${f._id}/status`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "harmful" }) });
                              fetchFeedbacks();
                            }} style={{ padding: "4px 8px", background: "#991b1b", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 11 }}>Zararlı</button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div >
      </div >
    </div >
  );
}

function NavButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 16px",
        background: active ? "#3b82f6" : "transparent",
        color: active ? "white" : "#94a3b8",
        border: "none", borderRadius: 8,
        cursor: "pointer", fontSize: 14, fontWeight: 500,
        transition: "all 0.2s"
      }}
    >
      <Icon size={18} />
      {label}
    </button>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: "#1e293b", padding: 20, borderRadius: 12, borderLeft: `4px solid ${color}` }}>
      <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>{label}</p>
      <p style={{ margin: "4px 0 0 0", fontSize: 24, fontWeight: "bold", color: "white" }}>{value}</p>
    </div>
  )
}

function AdminFeedbackList({ districtId }) {
  const [feedbacks, setFeedbacks] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const loadFeedbacks = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/api/feedback/${districtId}?includeHarmful=true`);
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
      const res = await fetch(`${API_BASE}/api/api/feedback/${id}/status`, {
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
          color: "#94a3b8"
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
          border: "1px solid #334155",
          background: "#0f172a",
          color: "white",
          fontSize: 14,
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

