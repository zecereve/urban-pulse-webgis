const mongoose = require("mongoose");

const EventLogSchema = new mongoose.Schema(
  {
    method: String,
    path: String,
    status: Number,
    durationMs: Number,
    ip: String,
    userId: { type: String, default: null },
    role: { type: String, default: "guest" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("EventLog", EventLogSchema);
