const express = require("express");
const router = express.Router();

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

    if (!user || user.password !== password) {
      return res
        .status(401)
        .json({ message: "Geçersiz kullanıcı veya şifre." });
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

module.exports = router;
