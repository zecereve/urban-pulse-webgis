require("dotenv").config();

const app = require("./app");
const connectMongo = require("./config/db.mongo");
const { testPostgres } = require("./config/db.postgres");

const PORT = process.env.PORT || 5050;

async function startServer() {
  try {
    // NoSQL
    await connectMongo();

    // SQL
    await testPostgres();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server start failed:", err.message);
    process.exit(1);
  }
}

startServer();
