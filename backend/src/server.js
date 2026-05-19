const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const path = require("path");

const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const feedbackRouter = require("./routes/feedback");
const issuesRouter = require("./routes/issues");
const swaggerDocs = require("./swagger");

const app = express();
const PORT = process.env.PORT || 5050;

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://ceremvermez_db_user:0611@cluster0.rsymqpq.mongodb.net/urban_pulse?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "urban_pulse";

let client;
global.db = null;

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  try {
    client = await MongoClient.connect(MONGO_URI);
    global.db = client.db(DB_NAME);
    isConnected = true;
    console.log("MongoDB baglandi");
  } catch (err) {
    console.error("MongoDB baglanti hatasi:", err);
  }
}

// Vercel'de her istekte veri tabanının bağlı olduğundan emin oluyoruz
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

async function start() {
  await connectDB();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API http://localhost:${PORT} uzerinde calisiyor`);
    swaggerDocs(app, PORT);
  });
}

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.options("*", cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api", adminRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/issues", issuesRouter);

// Uploads folder
app.use("/uploads", express.static("uploads"));

// Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return res.status(404).json({ error: "Not found" });
    res.sendFile(path.resolve(__dirname, '../', 'public', 'index.html'));
  });
}

// Sadece lokalde çalıştırırken app.listen yap, Vercel için app'i dışa aktar
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  start();
}

module.exports = app;
