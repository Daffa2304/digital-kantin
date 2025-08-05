const express = require('express');
const router = express.Router();
const db = require('../db');
const QRCode = require('qrcode');
const path = require('path');
const userController = require('../controllers/userController');

// Get menu list
router.get('/menu', async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM menus');
  res.json(rows);
});

// Search menu by keyword (name/category)
router.get('/menu/search', async (req, res) => {
  const keyword = `%${req.query.q || ''}%`;
  const [rows] = await db.execute(
    'SELECT * FROM menu WHERE name LIKE ? OR category LIKE ?',
    [keyword, keyword]
  );
  res.json(rows);
});

// AI Recommendation based on time
router.get('/recommendation', async (req, res) => {
  const hour = new Date().getHours();
  let category = '';

  if (hour < 11) category = 'Minuman';
  else if (hour < 16) category = 'Makanan';
  else category = 'Cemilan';

  const [rows] = await db.execute(
    'SELECT * FROM menus WHERE category = ? ORDER BY RAND() LIMIT 1',
    [category]
  );
  res.json(rows[0] || {});
});

// Place an order (with QR)
router.post('/orders', async (req, res) => {
  const { user_id, menu_id } = req.body;
  const timestamp = new Date();
  const status = 'Pesanan sedang diproses';

  const [result] = await db.execute(
    'INSERT INTO orders (user_id, menu_id, status, created_at) VALUES (?, ?, ?, ?)',
    [user_id, menu_id, status, timestamp]
  );

  const orderId = result.insertId;
  const qrText = `order_id:${orderId}|user_id:${user_id}`;
  const qrCode = await QRCode.toDataURL(qrText);

  await db.execute('UPDATE orders SET qr_code = ? WHERE id = ?', [qrCode, orderId]);

  res.json({ message: 'Pesanan berhasil dibuat', orderId, qrCode });
});

router.get("/orders.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/user/orders.html"));
});

router.get("/user/history", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/user/history.html"));
});

// Get current orders (not finished)
router.get('/orders/:user_id', async (req, res) => {
  const user_id = req.params.user_id;
  const [rows] = await db.execute(
  );
  res.json(rows);
});

// Get order history (finished)
router.get("/history/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log("Ambil pesanan user ID:", userId);
  const orders = await db.query[userId];
  res.json(orders[0]);
});

// TIDAK PERLU CEK LOGIN
router.get('/', (req, res) => {
  res.render('user/home');
});

router.get('/menu', async (req, res) => {
  const [menu] = await db.query('SELECT * FROM menu');
  res.render('user/menu', { menu });
});

router.get('/scanresult/:orderId', async (req, res) => {
  const orderId = req.params.orderId;
  const [rows] = await db.query(`
    SELECT o.id as order_id, o.user_id, o.created_at, o.total_price, m.name as menu_name, od.quantity
    FROM orders o
    JOIN order_details od ON o.id = od.order_id
    JOIN menu m ON od.menu_id = m.id
    WHERE o.id = ?
  `, [orderId]);

  res.render('scanresult', { orderDetails: rows });
});

// Endpoint untuk ambil detail order berdasarkan ID
router.get('/:orderId', async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const [orderRows] = await db.query(`
      SELECT o.id, o.user_id, u.name as user_name, o.total_price, o.created_at
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [orderId]);

    const [items] = await db.query(`
      SELECT m.name, od.quantity
      FROM order_details od
      JOIN menu m ON od.menu_id = m.id
      WHERE od.order_id = ?
    `, [orderId]);

    if (orderRows.length === 0) {
      return res.status(404).json({ error: "Order tidak ditemukan" });
    }

    const order = orderRows[0];
    order.items = items;

    res.json({ order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil detail order" });
  }
});

module.exports = router;