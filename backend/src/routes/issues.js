const express = require("express");
const { ObjectId } = require("mongodb");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Upload config for issue photos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

/**
 * GET /api/issues
 * Get all issues (or filter by bounds/district if needed later)
 */
router.get("/", async (req, res) => {
    try {
        const issuesCol = global.db.collection("issues");
        const issues = await issuesCol.find({}).sort({ createdAt: -1 }).toArray();
        res.json(issues);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch issues." });
    }
});

/**
 * POST /api/issues
 * Report a new issue
 */
router.post("/", upload.single("image"), async (req, res) => {
    try {
        const { lat, lng, type, description, district_id } = req.body;

        if (!lat || !lng || !type) {
            return res.status(400).json({ error: "Missing required fields (lat, lng, type)." });
        }

        const issuesCol = global.db.collection("issues");

        const newIssue = {
            latitude: Number(lat),
            longitude: Number(lng),
            district_id: district_id ? new ObjectId(district_id) : null,
            type, // e.g., "pothole", "lighting", "traffic", "garbage"
            description: description || "",
            imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
            status: "open", // open, in_progress, resolved
            createdAt: new Date()
        };

        const result = await issuesCol.insertOne(newIssue);
        newIssue._id = result.insertedId;

        res.json(newIssue);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create issue." });
    }
});

/**
 * PUT /api/issues/:id/status
 * Admin/Analyst update status
 */
router.put("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // open, resolved...

        const issuesCol = global.db.collection("issues");
        await issuesCol.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status, updatedAt: new Date() } }
        );
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update status." });
    }
});

/**
 * DELETE /api/issues/:id
 * Admin/Analyst delete issue
 */
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const issuesCol = global.db.collection("issues");
        const result = await issuesCol.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 1) {
            res.json({ ok: true, message: "Issue deleted" });
        } else {
            res.status(404).json({ error: "Issue not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete issue." });
    }
});

module.exports = router;
