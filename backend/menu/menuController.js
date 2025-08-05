const db = require("../db");

// Ambil semua menu
exports.getMenus = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM menus");
  res.json(rows);
};

// Tambah menu (admin)
exports.addMenu = async (req, res) => {
  const { name, description, price, category } = req.body;
  const file = req.file;
  const image_url = file ? file.filename : null
  await db.query(
    "INSERT INTO menus (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)",
    [name, description, price, category, image_url]
  );
  res.json({ message: "Menu berhasil ditambahkan" });
};

// Hapus menu (admin)
exports.deleteMenu = async (req, res) => {
  const id = req.params.id;
  await db.query("DELETE FROM menu WHERE id = ?", [id]);
  res.json({ message: "Menu berhasil dihapus" });
};

exports.editMenu = async (req, res) => {
const id = req.params.id;
const { name, description, price, category, existing_image } = req.body;
const file = req.file;
const image_url = file ? file.filename : existing_image;
await db.query(
"UPDATE menus SET name = ?, description = ?, price = ?, category = ?, image_url = ? WHERE id = ?",
[name, description, price, category, image_url, id]
);
res.json({ message: "Menu berhasil diperbarui" });
}

exports.getMenuById = async (req, res) => {
const id = req.params.id;
const [rows] = await db.query("SELECT * FROM menus WHERE id = ?", [id]);
res.json(rows[0]);
};

exports.deleteMenu = async (req, res) => {
const id = req.params.id;
await db.query("DELETE FROM menus WHERE id = ?", [id]);
res.json({ message: "Menu berhasil dihapus" });
};