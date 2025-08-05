const bcrypt = require("bcrypt");
const db = require("./db");

async function seed() {
  const password = await bcrypt.hash("admin123", 10);
  await db.query("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [
    "admin",
    password,
    "admin",
  ]);
  console.log("User admin ditambahkan.");
  process.exit();
}

seed();
