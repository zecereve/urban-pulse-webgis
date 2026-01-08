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
/**
 * @swagger
 * tags:
 *   name: Feedback
 *   description: Citizen feedback management
 */

/**
 * @swagger
 * /feedback:
 *   post:
 *     summary: Submit feedback for a district
 *     tags: [Feedback]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               district_id:
 *                 type: string
 *               rating:
 *                 type: integer
 *               comment:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Feedback submitted
 */
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

/**
 * @swagger
 * /feedback/{districtId}:
 *   get:
 *     summary: Get all feedbacks for a specific district
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: districtId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of feedbacks
 */
// GET /api/feedback/all (Global list for Admin)
router.get("/all", async (req, res) => {
    try {
        const feedbacksCol = global.db.collection("feedbacks");
        const items = await feedbacksCol.find({}).sort({ createdAt: -1 }).toArray();
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch all feedbacks" });
    }
});

// GET /api/feedback/:districtId
router.get("/:districtId", async (req, res) => {
    try {
        const { districtId } = req.params;
        const { includeHarmful } = req.query;
        const feedbacksCol = global.db.collection("feedbacks");

        // Build query
        const query = { district_id: new ObjectId(districtId) };
        if (includeHarmful !== "true") {
            query.status = { $ne: "harmful" };
        }

        // İlgili ilçeye ait yorumları getir (en yeniden eskiye)
        const items = await feedbacksCol
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();

        return res.json(items);
    } catch (err) {
        console.error("Feedback get error:", err);
        return res.status(500).json({ message: "Sunucu hatası." });
    }
});

/**
 * @swagger
 * /feedback/{id}/status:
 *   put:
 *     summary: Update feedback status (Moderation)
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [useful, harmful, pending]
 *                 example: useful
 *     responses:
 *       200:
 *         description: Status updated
 */
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
