// src/LoginPage.jsx
import React, { useState } from "react";
import logo from "./img/logo.png"; // logo: frontend/src/img/logo.png

const API_BASE = "http://51.20.188.13:5050";

export default function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Giriş başarısız.");
      } else {
        onLoginSuccess(data.user || data);
      }
    } catch {
      setError("Sunucuya bağlanırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          role: "citizen",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kayıt başarısız.");
      } else {
        setMode("login");
        setEmail(registerEmail);
        setPassword("");
        setRegisterEmail("");
        setRegisterPassword("");
      }
    } catch {
      setError("Sunucuya bağlanırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top left, #1d4ed8 0, #020617 55%)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Logo + başlık */}
      <div
        style={{
          position: "absolute",
          top: 32,
          left: 40,
          display: "flex",
          alignItems: "center",
          gap: 12,
          color: "white",
        }}
      >
        <img
          src={logo}
          alt="Urban Pulse"
          style={{ height: 52, borderRadius: 12 }}
        />
        <div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 0.4,
            }}
          >
            Urban Pulse
          </div>
          <div style={{ fontSize: 13, color: "#cbd5f5" }}>
            Smart city insights
          </div>
        </div>
      </div>

      {/* Form kartı */}
      <div
        style={{
          width: 420,
          background: "white",
          padding: 32,
          borderRadius: 16,
          boxShadow: "0 24px 50px rgba(15,23,42,0.45)",
        }}
      >
        <h2
          style={{
            marginBottom: 8,
            fontSize: 24,
            textAlign: "center",
            color: "#0f172a",
          }}
        >
          {mode === "login" ? "Hesabına giriş yap" : "Yeni hesap oluştur"}
        </h2>
        <p
          style={{
            marginBottom: 24,
            fontSize: 13,
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          {mode === "login"
            ? "Admin veya analyst hesabın varsa bilgilerini gir."
            : "Kayıt olan tüm kullanıcılar citizen rolüyle açılır."}
        </p>

        {/* Sekmeler */}
        <div
          style={{
            display: "flex",
            marginBottom: 24,
            borderRadius: 999,
            background: "#e5e7eb",
            padding: 4,
          }}
        >
          <button
            onClick={() => setMode("login")}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background: mode === "login" ? "white" : "transparent",
              fontWeight: mode === "login" ? 600 : 400,
            }}
          >
            Giriş
          </button>
          <button
            onClick={() => setMode("register")}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              background: mode === "register" ? "white" : "transparent",
              fontWeight: mode === "register" ? 600 : 400,
            }}
          >
            Kayıt Ol
          </button>
        </div>

        {error && (
          <p
            style={{
              marginBottom: 16,
              color: "#b91c1c",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}

        {mode === "login" ? (
          <form onSubmit={handleLogin}>
            <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />

            <label
              style={{
                display: "block",
                fontSize: 14,
                marginBottom: 4,
                marginTop: 12,
              }}
            >
              Şifre
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 20,
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
              {loading ? "Gönderiliyor..." : "Giriş Yap"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>
              Email
            </label>
            <input
              type="email"
              required
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              style={inputStyle}
            />

            <label
              style={{
                display: "block",
                fontSize: 14,
                marginBottom: 4,
                marginTop: 12,
              }}
            >
              Şifre
            </label>
            <input
              type="password"
              required
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              style={inputStyle}
            />

            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
              Yeni hesaplar otomatik olarak citizen rolüyle açılır.
            </p>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 16,
                width: "100%",
                padding: "10px 12px",
                backgroundColor: "#10b981",
                color: "white",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {loading ? "Gönderiliyor..." : "Kayıt Ol"}
            </button>
          </form>
        )}

        <div
          style={{
            marginTop: 24,
            fontSize: 12,
            color: "#6b7280",
            lineHeight: 1.5,
          }}
        >
          <p>Örnek admin: admin@example.com / password123</p>
          <p>Örnek analyst: analyst@example.com / password123</p>
          <p>Örnek citizen: citizen@example.com / password123</p>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: 14,
  boxSizing: "border-box",
};
