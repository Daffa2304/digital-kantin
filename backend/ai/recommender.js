const db = require("../db");

async function getRecommendation(userId) {
  // Ambil semua order user
  const orders = await db.query("SELECT id FROM orders WHERE user_id = $1", [userId]);
  const orderIds = orders.rows.map(row => row.id);

  if (orderIds.length === 0) return [];

  // Ambil semua item dari order tersebut
  const items = await db.query(
    `SELECT menu_id, COUNT(*) as freq 
     FROM order_items 
     WHERE order_id = ANY($1) 
     GROUP BY menu_id 
     ORDER BY freq DESC`, 
     [orderIds]
  );

  if (items.rows.length === 0) return [];

  const topMenuId = items.rows[0].menu_id;

  // Ambil data menu terfavorit user
  const menu = await db.query("SELECT * FROM menus WHERE id = $1", [topMenuId]);
  const keyword = menu.rows[0].name.split(" ")[0].toLowerCase(); // ambil kata kunci pertama

  // Cari menu lain yang punya nama mirip, tapi bukan menu itu
  const recommended = await db.query(
    "SELECT * FROM menus WHERE LOWER(name) LIKE $1 AND id != $2 LIMIT 3",
    [`%${keyword}%`, topMenuId]
  );

  return recommended.rows;
}

module.exports = { getRecommendation };
