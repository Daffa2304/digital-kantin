const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const session = require('express-session');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (kalau digunakan login)
app.use(session({
  secret: "kantin-secret",
  resave: false,
  saveUninitialized: false
}));

// Import Routes 
const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const historyRoutes = require("./routes/historyRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Static Folder
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));
app.use("/user", express.static(path.join(__dirname, "../frontend/user")));
app.use("/admin", express.static(path.join(__dirname, "../frontend/admin")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(express.static(path.join(__dirname, "../frontend"))); 

// Public Pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});
app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/user/home.html"));
});
app.get("/menu", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/user/menu.html"));
});

// Login & Register Pages
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/register.html"));
});
app.get("/orders", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/user/orders.html"));
});
app.get("/history",  (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/user/history.html"));
});
app.get("/scanresult/:orderId", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/user/scanresult.html"));
});

// Admin dashboard
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/admin/dashboard.html"));
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/orders", orderRoutes); 
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use('/', userRoutes);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server jalan di http://localhost:${PORT}`);
});