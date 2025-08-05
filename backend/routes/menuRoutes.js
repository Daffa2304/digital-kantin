const express = require("express");
const router = express.Router();
const db = require("../db");

// Ambil semua menu
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM menus");
    res.json(rows);
  } catch (error) {
    console.error("Error ambil menu:", error);
    res.status(500).json({ message: "Gagal ambil data menu" });
  }
});

module.exports = router;
