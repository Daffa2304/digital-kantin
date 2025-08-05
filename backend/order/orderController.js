const db = require("../db");
const QRCode = require("qrcode")

// Buat pesanan
exports.createOrders = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const userId = req.body.user_id;
    const cartItems = req.body.items;

    if (!userId) {
      return res.status(401).json({ message: "User belum login." });
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Keranjang kosong." });
    }

    await connection.beginTransaction();

    // 1. Buat pesanan
    const [orderResult] = await connection.query(
      "INSERT INTO orders (user_id, status) VALUES (?, 'pending')",
      [userId]
    );
    const orderId = orderResult.insertId;
    const qrText = `order_id:${orderId}|user_id:${userId}`;
    const qrCode = await QRCode.toDataURL(qrText);
    await connection.query(
    "UPDATE orders SET qr_code = ? WHERE id = ?",
    [qrCode, orderId]
    );
    // 2. Simpan semua item ke order_items
    for (const item of cartItems) {
      await connection.query(
        "INSERT INTO order_items (order_id, menu_id, quantity) VALUES (?, ?, ?)",
        [orderId, item.menu_id, item.quantity]
      );
    }

    await connection.commit();
    res.status(201).json({ message: "Pesanan berhasil dibuat." });
  } catch (err) {
    await connection.rollback();
    // console.error("Gagal membuat pesanan:", err);
    console.log("Gagal membuat pesanan:", err);
    res.status(500).json({ message: "Gagal membuat pesanan." });
  } finally {
    connection.release();
  }
};

// Ambil pesanan milik user
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.session.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User belum login." });
    }

    const [orders] = await db.query(
  `SELECT orders.status, orders.id AS order_id,
          orders.user_id, orders.created_at, orders.qr_code,
          orders.is_cancelled, orders.cancel_reason, -- tambahkan ini
          order_items.*, menus.name AS menu_name, menus.price,
          (order_items.quantity * menus.price) AS subtotal
   FROM order_items
   INNER JOIN orders ON orders.id = order_items.order_id
   INNER JOIN menus ON menus.id = order_items.menu_id
   WHERE orders.user_id = ? AND orders.status IN ('pending','diproses','menunggu konfirmasi','siap diambil')
   ORDER BY orders.created_at DESC`,
  [userId]
    );

    const groupedOrders = [];

    orders.forEach(row => {
      let order = groupedOrders.find(o => o.order_id === row.order_id);
      if (!order) {
        order = {
          order_id: row.order_id,
          created_at: row.created_at,
          status: row.status,
          qr_code: row.qr_code,
          is_cancelled: row.is_cancelled,
          cancel_reason: row.cancel_reason,
          items: [],
          total: 0
        };
        groupedOrders.push(order);
      }

      order.items.push({
        menu_name: row.menu_name,
        price: row.price,
        quantity: row.quantity,
        subtotal: row.subtotal
      });

      order.total += parseInt(row.subtotal);
    });

    res.status(200).json(groupedOrders);
  } catch (err) {
    console.error("Error ambil pesanan user:", err);
    res.status(500).json({ message: "Gagal ambil pesanan." });
  }
};

exports.getUserOrderHistory = exports.getUserOrders;

// Admin ambil semua pesanan
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT orders.id, users.username, orders.items, orders.status, orders.created_at
      FROM orders
      JOIN users ON orders.user_id = users.id
      ORDER BY orders.created_at DESC
    `);

    const formatted = orders.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Gagal ambil semua pesanan:", err);
    res.status(500).json({ message: "Gagal ambil semua pesanan." });
  }
};

// Admin update status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const valid = ['menunggu konfirmasi', 'sedang diproses', 'sudah jadi'];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: "Status tidak valid." });
    }

    await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
    res.json({ message: "Status diperbarui." });
  } catch (err) {
    console.error("Error update status:", err);
    res.status(500).json({ message: "Gagal update status." });
  }
};

// Tampilkan HTML daftar pesanan
exports.renderAdminOrderHTML = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT orders.id, users.username, orders.items, orders.status, orders.created_at
      FROM orders
      JOIN users ON orders.user_id = users.id
      ORDER BY orders.created_at DESC
    `);

    let html = `
      <h2>Daftar Pesanan Masuk</h2>
      <table border="1" cellpadding="8" cellspacing="0">
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>Items</th>
          <th>Status</th>
          <th>Waktu</th>
        </tr>
    `;

    for (const order of orders) {
      const items = JSON.parse(order.items);
      let itemList = "<ul>";
      items.forEach(item => {
        itemList += `<li>${item.menu_name} x ${item.quantity}</li>`;
      });
      itemList += "</ul>";

      html += `
        <tr>
          <td>${order.id}</td>
          <td>${order.username}</td>
          <td>${itemList}</td>
          <td>${order.status}</td>
          <td>${new Date(order.created_at).toLocaleString()}</td>
        </tr>
      `;
    }

    html += "</table>";
    res.send(html);
  } catch (err) {
    console.error("Gagal render HTML:", err);
    res.status(500).send("Gagal menampilkan pesanan.");
  }
};

exports.cancelOrder = async (req, res) => {
  const orderId = req.params.orderId;
  const cancelReason = req.body?.cancel_reason || "Tanpa alasan";

  const connection = await db.getConnection();
  try {
    await connection.query(
      "UPDATE orders SET status = 'dibatalkan', is_cancelled = 1, cancel_reason = ? WHERE id = ?",
      [cancelReason, orderId]
    );
    res.json({ success: true, message: "Pesanan berhasil dibatalkan." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal membatalkan pesanan." });
  } finally {
    connection.release();
  }
};

exports.getOrderById = async (req, res) => {
  const orderId = req.params.id;
  const connection = await db.getConnection();
  try {
    const [orderRows] = await connection.query(`
      SELECT o.id AS order_id, o.status, o.cancel_reason, o.created_at, m.name AS menu_name, od.quantity
      FROM orders o
      JOIN order_details od ON o.id = od.order_id
      JOIN menu m ON od.menu_id = m.id
      WHERE o.id = ?
    `, [orderId]);

    if (orderRows.length === 0) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan." });
    }

    res.status(200).json(orderRows);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data pesanan.", error: err });
  } finally {
    connection.release();
  }
};
