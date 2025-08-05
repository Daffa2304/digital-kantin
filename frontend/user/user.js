const user = JSON.parse(localStorage.getItem("user"));
document.getElementById("user-info").innerText = `Selamat datang, ${user.username}`;
console.log("User dari localStorage:", user);

// Ambil menu dari server
async function loadMenus() {
  const res = await fetch("http://localhost:3000/api/menu");
  const menus = await res.json();

  const menuDiv = document.getElementById("menu-list");
  menus.forEach(menu => {
    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${menu.name}</h3>
      <p>${menu.description}</p>
      <p>Rp${menu.price}</p>
      <input type="number" id="qty-${menu.id}" placeholder="Qty" min="1">
      <button onclick="order(${menu.id})">Pesan</button>
      <hr>
    `;
    menuDiv.appendChild(div);
  });
}

loadMenus();

// Fungsi order makanan
async function order(menuId) {
  const qty = document.getElementById(`qty-${menuId}`).value;
  if (!qty || qty <= 0) {
    alert("Isi jumlah dulu!");
    return;
  }

  const res = await fetch("http://localhost:3000/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: user.id,
      items: [{ menu_id: menuId, quantity: parseInt(qty) }]
    })
  });

  const result = await res.json();
  alert(result.message);
}
