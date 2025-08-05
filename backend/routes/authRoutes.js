const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db");
const session = require('express-session');

// REGISTER
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length > 0) return res.status(404).json({ message: "User telah digunakan" });
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, hashedPassword, role]);
    res.status(201).json({ message: "User berhasil diregistrasi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan saat registrasi" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Password salah" });
    req.session.user = { id: user.id, username: user.username, role: user.role }
    res.status(200).json({ message: "Login berhasil", user: {
      id : user.id,
      username: user.username,
      role: user.role,
    } });    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan saat login" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Terjadi kesalahan saat logout" });
    } else {
      res.status(200).json({ message: "Logout berhasil" });
    }
  });
});

module.exports = router;
