// backend/src/routes/admin.js
const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();

/**
 * Admin panel haritası için lokasyonlar
 * URL: GET http://localhost:5050/api/urban/locations
 */
router.get("/urban/locations", async (req, res) => {
  try {
    const locationsCol = global.db.collection("locations");
    const items = await locationsCol.find({}).toArray();
    return res.json(items);
  } catch (err) {
    console.error("Lokasyon listeleme hatasi:", err);
    return res
      .status(500)
      .json({ error: "Lokasyonlar yuklenirken sunucu hatasi olustu." });
  }
});



/**
 * Yeni lokasyon ekle
 * URL: POST http://localhost:5050/api/locations
 */
router.post("/locations", async (req, res) => {
  try {
    const { name, lat, lng, population } = req.body;

    if (!name || !lat || !lng) {
      return res.status(400).json({ error: "Isim, enlem ve boylam zorunludur." });
    }

    const locationsCol = global.db.collection("locations");
    const newLocation = {
      district_name: name,
      latitude: Number(lat),
      longitude: Number(lng),
      population: Number(population) || 0,
      urban_score: 5, // Varsayılanlar
      air_quality: 50,
      traffic_intensity: 5,
      noise_level: 50,
      updatedAt: new Date()
    };

    const result = await locationsCol.insertOne(newLocation);
    newLocation._id = result.insertedId;

    return res.json(newLocation);
  } catch (err) {
    console.error("Lokasyon ekleme hatasi:", err);
    return res.status(500).json({ error: "Sunucu hatasi." });
  }
});

/**
 * Lokasyon sil
 * URL: DELETE http://localhost:5050/api/locations/:id
 */
router.delete("/locations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const locationsCol = global.db.collection("locations");

    const result = await locationsCol.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Lokasyon bulunamadi." });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("Lokasyon silme hatasi:", err);
    return res.status(500).json({ error: "Sunucu hatasi." });
  }
});

/**
 * Seçili lokasyonu güncelle
 * URL: PUT http://localhost:5050/api/locations/:id
 */
router.put("/locations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      air_quality,
      traffic_intensity,
      noise_level,
      urban_score,
    } = req.body;

    const locationsCol = global.db.collection("locations");

    await locationsCol.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          air_quality: Number(air_quality),
          traffic_intensity: Number(traffic_intensity),
          noise_level: Number(noise_level),
          urban_score: Number(urban_score),
        },
      }
    );

    const updated = await locationsCol.findOne({ _id: new ObjectId(id) });

    return res.json(updated);
  } catch (err) {
    console.error("Lokasyon guncelleme hatasi:", err);
    return res
      .status(500)
      .json({ error: "Lokasyon guncellenirken sunucu hatasi olustu." });
  }
});

/**
 * Analyst dashboard için özet istatistikler
 * URL: GET http://localhost:5050/api/urban/stats
 */
router.get("/urban/stats", async (req, res) => {
  try {
    const locationsCol = global.db.collection("locations");

    const totalLocations = await locationsCol.countDocuments();

    const agg = await locationsCol
      .aggregate([
        {
          $group: {
            _id: null,
            avgUrbanScore: { $avg: "$urban_score" },
            avgAirQuality: { $avg: "$air_quality" },
            totalPopulation: { $sum: "$population" },
          },
        },
      ])
      .toArray();

    const stats = agg[0] || {
      avgUrbanScore: 0,
      avgAirQuality: 0,
      totalPopulation: 0,
    };

    return res.json({
      ok: true,
      total_locations: totalLocations,
      avg_urban_score: stats.avgUrbanScore,
      avg_air_quality: stats.avgAirQuality,
      total_population: stats.totalPopulation,
    });
  } catch (err) {
    console.error("urban/stats hatasi:", err);
    return res
      .status(500)
      .json({ error: "İstatistikler alınırken sunucu hatası oluştu." });
  }
});

module.exports = router;
