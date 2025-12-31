const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function testPostgres() {
  const r = await pool.query("SELECT NOW() as now");
  console.log("✅ Postgres connected, time:", r.rows[0].now);
}

module.exports = { pool, testPostgres };
