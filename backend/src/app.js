// src/app.js
const express = require("express");
const cors = require("cors");
const { pool } = require("./config/db.postgres");

const app = express();

app.use(cors());
app.use(express.json());

// Sağlık kontrolü
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Urban Pulse backend is running" });
});

// LOGIN ENDPOINT
// POST /api/auth/login
// body: { email: string, password: string }
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Email ve şifre zorunludur." });
  }

  try {
    // email'e göre kullanıcıyı bul
    const result = await pool.query(
      "SELECT id, email, password_hash, role FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ error: "Geçersiz email veya şifre." });
    }

    const user = result.rows[0];

    // Şimdilik düz metin karşılaştırma (password_hash kolonunu kullanıyoruz)
    if (user.password_hash !== password) {
      return res
        .status(401)
        .json({ error: "Geçersiz email veya şifre." });
    }

    // Şifre doğruysa kullanıcı bilgilerini (role dahil) döndür
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("Error in /api/auth/login:", err.message);
    res.status(500).json({ error: "Login sırasında hata oluştu." });
  }
});

// İSTATİSTİK ENDPOINTİ (analyst/admin için kullanılacak)
// GET /api/urban/stats
app.get("/api/urban/stats", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS total_locations,
        AVG(urban_score) AS avg_urban_score,
        AVG(air_quality) AS avg_air_quality,
        AVG(traffic_intensity) AS avg_traffic_intensity,
        AVG(noise_level) AS avg_noise_level,
        SUM(population) AS total_population
      FROM urban_locations;
    `);

    res.json(result.rows[0]); // tek satır dönecek
  } catch (err) {
    console.error("Error fetching urban stats:", err.message);
    res.status(500).json({ error: "Stats hesaplanırken hata oluştu." });
  }
});

// Tüm urban_locations kayıtlarını getir
// GET /api/urban/locations
app.get("/api/urban/locations", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM urban_locations ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching urban locations:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ADMIN: TÜM KULLANICILARI LİSTELE
// GET /api/admin/users
app.get("/api/admin/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, role, created_at FROM users ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ error: "Kullanıcılar alınırken hata oluştu." });
  }
});

// ADMIN: YENİ KULLANICI OLUŞTUR
// POST /api/admin/users
// body: { email, password, role }
app.post("/api/admin/users", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res
      .status(400)
      .json({ error: "email, password ve role zorunludur." });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, $3)
      RETURNING id, email, role, created_at
      `,
      [email, password, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating user:", err.message);
    res.status(500).json({ error: "Kullanıcı oluşturulurken hata oluştu." });
  }
});

// ADMIN: KULLANICI GÜNCELLE (şifre ve/veya rol)
// PUT /api/admin/users/:id
// body: { password?, role? }
app.put("/api/admin/users/:id", async (req, res) => {
  const { id } = req.params;
  const { password, role } = req.body;

  if (!password && !role) {
    return res
      .status(400)
      .json({ error: "Güncellemek için en az password veya role gönder." });
  }

  try {
    const fields = [];
    const values = [];
    let idx = 1;

    if (password) {
      fields.push(`password_hash = $${idx++}`);
      values.push(password);
    }
    if (role) {
      fields.push(`role = $${idx++}`);
      values.push(role);
    }

    values.push(id);

    const query = `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE id = $${idx}
      RETURNING id, email, role, created_at
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating user:", err.message);
    res.status(500).json({ error: "Kullanıcı güncellenirken hata oluştu." });
  }
});

// ADMIN: KULLANICI SİL
// DELETE /api/admin/users/:id
app.delete("/api/admin/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id, email, role",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    res.json({ message: "Kullanıcı silindi.", user: result.rows[0] });
  } catch (err) {
    console.error("Error deleting user:", err.message);
    res.status(500).json({ error: "Kullanıcı silinirken hata oluştu." });
  }
});

module.exports = app;
