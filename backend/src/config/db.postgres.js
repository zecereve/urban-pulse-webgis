// src/config/db.postgres.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function testPostgres() {
  try {
    const r = await pool.query("SELECT NOW() as now");
    console.log("✅ Postgres connected, time:", r.rows[0].now);
  } catch (err) {
    console.error("❌ Postgres connection error:", err.message);
    throw err;
  }
}

module.exports = { pool, testPostgres };
