// Load menu makanan
async function loadMenus() {
  const res = await fetch("http://localhost:3000/api/menu");
  const menus = await res.json();
  const container = document.getElementById("menu-list");
  container.innerHTML = "";

  menus.forEach(menu => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${menu.name}</strong> - Rp${menu.price}<br>
      ${menu.description}<br><hr>
    `;
    container.appendChild(div);
  });
}

// Tambah menu makanan
document.getElementById("menu-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const name = document.getElementById("menu-name").value;
  const description = document.getElementById("menu-desc").value;
  const price = document.getElementById("menu-price").value;

  const res = await fetch("http://localhost:3000/api/admin/menu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description, price })
  });

  const data = await res.json();
  alert(data.message);
  loadMenus();
});

loadMenus();

// Ambil daftar pesanan user
async function loadOrders() {
  const res = await fetch("http://localhost:3000/api/admin/orders");
  const orders = await res.json();

  const container = document.getElementById("order-list");
  container.innerHTML = "";

  orders.forEach(order => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>Pemesan:</strong> ${order.username}<br>
      <strong>Status:</strong> ${order.status}<br>
      <strong>Tanggal:</strong> ${new Date(order.created_at).toLocaleString()}<br>
      <button onclick="updateStatus(${order.id}, 'diproses')">Proses</button>
      <button onclick="updateStatus(${order.id}, 'selesai')">Selesai</button>
      <div id="qr-${order.id}"></div>
      <hr>
    `;

    container.appendChild(div);

    if (order.status === "selesai") {
      const qrData = `OrderID:${order.id} | User:${order.username}`;
      QRCode.toCanvas(document.getElementById(`qr-${order.id}`), qrData, error => {
        if (error) console.error(error);
      });
    }
  });
}

async function updateStatus(orderId, status) {
  const res = await fetch(`http://localhost:3000/api/admin/orders/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });

  const data = await res.json();
  alert(data.message);
  loadOrders();
}

loadOrders();
