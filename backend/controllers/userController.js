const db = require("../db");

exports.getMenus = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM menus");
  res.json(rows);
};

exports.recommendation = async (req, res) => {
  const hour = new Date().getHours();
  let category = "Makanan";
  if (hour < 11) category = "Makanan";
  else if (hour < 16) category = "Cemilan";
  else category = "Minuman";

  const [rows] = await db.query("SELECT * FROM menus WHERE category = ?", [category]);
  const recommendation = rows[Math.floor(Math.random() * rows.length)];
  res.json(recommendation || {});
};

exports.placeOrder = async (req, res) => {
  const { user_id, menu_id } = req.body;
  await db.query("INSERT INTO orders (user_id, menu_id) VALUES (?, ?)", [user_id, menu_id]);
  res.status(201).json({ message: "Pesanan berhasil dibuat" });
};

exports.getOrders = async (req, res) => {
  const { user_id } = req.query;
  const [orders] = await db.query(`
    SELECT o.id, m.name, m.price, o.status 
    FROM orders o 
    JOIN menus m ON o.menu_id = m.id 
    WHERE o.user_id = ?`, [user_id]);
  res.json(orders);
};

exports.getHistory = async (req, res) => {
  const { user_id } = req.query;
  const [orders] = await db.query(`
    SELECT o.id, m.name, m.price 
    FROM orders o 
    JOIN menus m ON o.menu_id = m.id 
    WHERE o.user_id = ? AND o.status = 'selesai'`, [user_id]);
  res.json(orders);
};
