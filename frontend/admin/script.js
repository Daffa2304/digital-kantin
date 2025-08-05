// frontend/admin/script.js

// Tambah menu baru
async function addMenu(name, description, price, imageUrl) {
  await fetch("http://localhost:3000/api/admin/menu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description, price, image_url: imageUrl }),
  });
  alert("Menu berhasil ditambahkan!");
}

// Tampilkan semua pesanan
async function loadOrders() {
  const res = await fetch("http://localhost:3000/api/admin/orders");
  const data = await res.json();
  const div = document.getElementById("orders");
  div.innerHTML = "";

  data.forEach(order => {
    const item = document.createElement("div");
    item.innerHTML = `
      <p>ID: ${order.id} | User: ${order.user_id} | Status: ${order.status}</p>
      <button onclick="updateStatus(${order.id}, 'processing')">Proses</button>
      <button onclick="updateStatus(${order.id}, 'done')">Selesai</button>
      <button onclick="getQR(${order.id})">QR</button>
      <div id="qr-${order.id}"></div>
    `;
    div.appendChild(item);
  });
}

// Update status pesanan
async function updateStatus(orderId, status) {
  await fetch(`http://localhost:3000/api/admin/orders/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  alert("Status pesanan diperbarui.");
  loadOrders();
}

// Generate dan tampilkan QR
async function getQR(orderId) {
  const res = await fetch(`http://localhost:3000/api/admin/orders/${orderId}/qr`);
  const data = await res.json();
  const qrDiv = document.getElementById(`qr-${orderId}`);
  qrDiv.innerHTML = `<img src="${data.qrImage}" width="100">`;
}

async function logout() {
    localStorage.removeItem("user");
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login.html";
}