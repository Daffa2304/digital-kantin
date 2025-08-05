document.querySelector("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.querySelector("#username").value;
  const password = document.querySelector("#password").value;

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (res.ok) {
    alert("Login berhasil sebagai " + data.role);
    if (data.role === "admin") {
      window.location.href = "/admin/dashboard.html";
    } else {
      window.location.href = "/user/home.html";
    }
  } else {
    alert("Login gagal: " + data.message);
  }
});


function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("cart")
    fetch("/api/logout", { method: "POST" });
    window.location.href = "/login.html";
}