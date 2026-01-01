const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { ObjectId } = require("mongodb");

const router = express.Router();

// Multer (Dosya Yükleme) Ayarları
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Dosya adı: timestamp-random.uzantı
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// POST /api/feedback
// Body: { district_id, rating, comment }
// File: image
router.post("/", upload.single("image"), async (req, res) => {
    try {
        const { district_id, rating, comment } = req.body;
        const file = req.file;

        if (!district_id || !rating) {
            return res.status(400).json({ message: "İlçe ve puan zorunludur." });
        }

        const feedbacksCol = global.db.collection("feedbacks");

        const feedback = {
            district_id: new ObjectId(district_id),
            rating: Number(rating),
            comment: comment || "",
            imageUrl: file ? `/uploads/${file.filename}` : null,
            createdAt: new Date(),
            status: "pending" // Varsayılan durum
        };

        const result = await feedbacksCol.insertOne(feedback);

        return res.json({
            ok: true,
            data: feedback,
            id: result.insertedId,
            message: "Geri bildirim kaydedildi.",
        });
    } catch (err) {
        console.error("Feedback post error:", err);
        return res.status(500).json({ message: "Sunucu hatası." });
    }
});

// GET /api/feedback/:districtId
router.get("/:districtId", async (req, res) => {
    try {
        const { districtId } = req.params;
        const feedbacksCol = global.db.collection("feedbacks");

        // İlgili ilçeye ait yorumları getir (en yeniden eskiye)
        const items = await feedbacksCol
            .find({ district_id: new ObjectId(districtId) })
            .sort({ createdAt: -1 })
            .toArray();

        return res.json(items);
    } catch (err) {
        console.error("Feedback get error:", err);
        return res.status(500).json({ message: "Sunucu hatası." });
    }
});

// PUT /api/feedback/:id/status
router.put("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // "useful", "harmful", "pending"

        if (!["useful", "harmful", "pending"].includes(status)) {
            return res.status(400).json({ message: "Geçersiz durum." });
        }

        const feedbacksCol = global.db.collection("feedbacks");
        const result = await feedbacksCol.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Geri bildirim bulunamadı." });
        }

        return res.json({ ok: true, message: "Durum güncellendi." });
    } catch (err) {
        console.error("Feedback status update error:", err);
        return res.status(500).json({ message: "Sunucu hatası." });
    }
});

module.exports = router;
