const db = require("../db");

exports.addMenu = async (req, res) => {
  const { name, description, price, category } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    await db.query(
      "INSERT INTO menus (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)",
      [name, description, price, category, image_url]
    );
    res.status(201).json({ message: "Menu berhasil ditambahkan" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menambahkan menu" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
    res.json({ message: "Status pesanan diperbarui" });
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui status" });
  }
};
