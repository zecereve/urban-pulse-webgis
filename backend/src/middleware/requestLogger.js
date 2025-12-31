const EventLog = require("../models/eventLog.model");

function requestLogger() {
  return (req, res, next) => {
    const start = Date.now();

    res.on("finish", async () => {
      const durationMs = Date.now() - start;

      try {
        await EventLog.create({
          method: req.method,
          path: req.originalUrl,
          status: res.statusCode,
          durationMs,
          ip:
            (req.headers["x-forwarded-for"] || "")
              .toString()
              .split(",")[0]
              .trim() || req.socket.remoteAddress,
          userId: req.user?.id ?? null,
          role: req.user?.role ?? "guest"
        });
      } catch (err) {
        console.error("⚠️ Mongo log write failed:", err.message);
      }
    });

    next();
  };
}

module.exports = requestLogger;
