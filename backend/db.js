const mysql = require("mysql2/promise"); // pakai promise biar bisa pakai async/await

const db = mysql.createPool({
  host: "localhost",
  user: "root",       // sesuaikan dengan user MySQL kamu
  password: "R@hasia123",       // isi jika ada password MySQL
  database: "kantin_db2", // sesuaikan dengan nama database kamu
});

module.exports = db;
