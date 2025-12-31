const mongoose = require("mongoose");

async function connectMongo() {
  try {
    const mongoUrl = process.env.MONGO_URL;

    if (!mongoUrl) {
      throw new Error("MONGO_URL .env dosyasında yok!");
    }

    mongoose.set("strictQuery", true);

    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ MongoDB Atlas connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

module.exports = connectMongo;
