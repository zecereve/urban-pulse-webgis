const express = require("express");
const cors = require("cors");

const requestLogger = require("./middleware/requestLogger");

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(requestLogger());

// routes
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Urban Pulse API is running" });
});

app.get("/ping", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

module.exports = app;
