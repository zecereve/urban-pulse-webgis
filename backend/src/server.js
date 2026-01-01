console.log("SERVER.JS BASLADI");

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");

const app = express();
const PORT = 5050;

const MONGO_URI =
  "mongodb+srv://ceremvermez_db_user:0611@cluster0.rsymqpq.mongodb.net/urban_pulse?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "urban_pulse";

let client;
global.db = null;

async function start() {
  try {
    client = await MongoClient.connect(MONGO_URI);
    global.db = client.db(DB_NAME);
    console.log("MongoDB baglandi");

    app.listen(PORT, () => {
      console.log(`API http://localhost:${PORT} uzerinde calisiyor`);
    });
  } catch (err) {
    console.error("MongoDB baglanti hatasi:", err);
    process.exit(1);
  }
}

app.use(
  cors({
    origin: ["http://localhost:5174", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.json());

const feedbackRouter = require("./routes/feedback");

// Login için
app.use("/api/auth", authRouter);

// Admin + analyst API'leri için
app.use("/api", adminRouter);

// Feedback API
app.use("/api/feedback", feedbackRouter);

// Uploads klasörünü dışarı aç (Resimleri görmek için)
app.use("/uploads", express.static("uploads"));

// Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

start();
