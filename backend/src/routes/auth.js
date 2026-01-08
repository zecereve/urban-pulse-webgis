const express = require("express");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
const bcrypt = require("bcrypt");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "E-posta ve şifre zorunludur." });
    }

    const usersCol = global.db.collection("users");
    const user = await usersCol.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Geçersiz kullanıcı veya şifre." });
    }

    // Check if password matches (bcrypt compare)
    // Fallback for simple plaintext if needed (but we strictly want bcrypt now)
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Geçersiz kullanıcı veya şifre." });
    }

    return res.json({
      ok: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role || "citizen",
      },
    });
  } catch (err) {
    console.error("Login hatası:", err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "E-posta ve şifre zorunludur." });
    }

    const usersCol = global.db.collection("users");
    const existingUser = await usersCol.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Bu e-posta zaten kullanılıyor." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      email,
      password: hashedPassword,
      role: "citizen",
      createdAt: new Date()
    };

    const result = await usersCol.insertOne(newUser);

    return res.json({
      ok: true,
      user: {
        id: result.insertedId,
        email: newUser.email,
        role: newUser.role,
      },
      message: "Kayıt başarılı."
    });
  } catch (err) {
    console.error("Register hatası:", err);
    return res.status(500).json({ message: "Sunucu hatası" });
  }
});


// GET /api/auth/users (Admin only ideally, but loose for now)
router.get("/users", async (req, res) => {
  try {
    const usersCol = global.db.collection("users");
    const users = await usersCol.find({}).toArray();
    // Remove passwords
    const safeUsers = users.map(u => ({ _id: u._id, email: u.email, role: u.role, createdAt: u.createdAt }));
    res.json(safeUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// DELETE /api/auth/users/:id
const { ObjectId } = require("mongodb");
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const usersCol = global.db.collection("users");
    await usersCol.deleteOne({ _id: new ObjectId(id) });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
