const db = require("../db");
const bcrypt = require("bcrypt");

// Register
exports.register = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role || !["user", "admin"].includes(role)) {
    return res.status(400).json({ message: "Data tidak valid" });
  }

  const [existing] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
  if (existing.length > 0) {
    return res.status(409).json({ message: "Username sudah digunakan" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, hashedPassword, role]
  );

  res.json({ id: result.insertId, username, role });
};

// Login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
  if (rows.length === 0) {
    return res.status(404).json({ message: "User tidak ditemukan" });
  }

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(401).json({ message: "Password salah" });
  }

  res.json({ id: user.id, username: user.username, role: user.role });
};

if (user && passwordMatch) {
  req.session.user = user;
  return res.redirect('/menu'); // Atau redirect ke halaman terakhir
}

req.session.user = {
  id: user.id,
  username: user.username,
  role: user.role
};

