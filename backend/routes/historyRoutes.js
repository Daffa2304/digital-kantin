const express = require("express");
const router = express.Router();
const db = require("../db");

// GET: Ambil riwayat pesanan user yang selesai
router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const [orders] = await db.query(`
      SELECT o.status, o.created_at, o.id as order_id, o.created_at, o.qr_code, 
             m.name AS menu_name, m.price, oi.quantity,
             (m.price * oi.quantity) AS subtotal
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN menus m ON oi.menu_id = m.id
      WHERE o.user_id = ? AND o.status = 'selesai'
      ORDER BY o.created_at DESC
    `, [user_id]);

    const groupedOrders = {};

    // Group by order_id
    orders.forEach(row => {
      if (!groupedOrders[row.order_id]) {
        groupedOrders[row.order_id] = {
          created_at:row.created_at, 
          status:row.status, 
          order_id: row.order_id,
          order_time: row.created_at,
          qr_code: row.qr_code,
          items: [],
          total: 0
        };
      }

      groupedOrders[row.order_id].items.push({
        menu_name: row.menu_name,
        price: row.price,
        quantity: row.quantity,
        subtotal: row.subtotal
      });

      groupedOrders[row.order_id].total += parseInt(row.subtotal);
    });

    res.status(200).json(Object.values(groupedOrders));
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Gagal mengambil riwayat pesanan" });
  }
});

module.exports = router;
