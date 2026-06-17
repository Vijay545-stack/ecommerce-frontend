const API_BASE = "https://ecommerce-backend-wwlq.onrender.com/api";

function getToken() { return localStorage.getItem("token"); }
function getUser() { const u = localStorage.getItem("user"); return u ? JSON.parse(u) : null; }
function saveAuth(data) { localStorage.setItem("token", data.token); localStorage.setItem("user", JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role })); }
function logout() { localStorage.removeItem("token"); localStorage.removeItem("user"); localStorage.removeItem("cart"); window.location.href = "index.html"; }
function isLoggedIn() { return !!getToken(); }
function isAdmin() { const u = getUser(); return u && u.role === "admin"; }

async function apiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers["Authorization"] = "Bearer " + token;
  const res = await fetch(API_BASE + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

function getCart() { const c = localStorage.getItem("cart"); return c ? JSON.parse(c) : []; }
function saveCart(cart) { localStorage.setItem("cart", JSON.stringify(cart)); updateCartBadge(); }
function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.productId === product._id);
  if (existing) existing.quantity += quantity;
  else cart.push({ productId: product._id, name: product.name, price: product.price, imageUrl: product.imageUrl, quantity });
  saveCart(cart);
}
function removeFromCart(productId) { saveCart(getCart().filter(i => i.productId !== productId)); }
function updateCartQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find(i => i.productId === productId);
  if (item) { item.quantity = quantity; if (item.quantity <= 0) { removeFromCart(productId); return; } }
  saveCart(cart);
}
function clearCart() { localStorage.removeItem("cart"); updateCartBadge(); }
function cartCount() { return getCart().reduce((s, i) => s + i.quantity, 0); }
function cartTotal() { return getCart().reduce((s, i) => s + i.price * i.quantity, 0); }
function updateCartBadge() { const b = document.getElementById("cart-count"); if (b) b.textContent = cartCount(); }

function renderNavbar() {
  const nav = document.getElementById("nav-links");
  if (!nav) return;
  const user = getUser();
  let html = `<a href="index.html">Shop</a>`;
  if (user) {
    html += `<a href="cart.html">Cart <span class="cart-badge" id="cart-count">0</span></a>`;
    html += `<a href="orders.html">My Orders</a>`;
    if (user.role === "admin") html += `<a href="admin.html">Admin</a>`;
    html += `<span>Hi, ${escapeHtml(user.name)}</span>`;
    html += `<button onclick="logout()">Logout</button>`;
  } else {
    html += `<a href="cart.html">Cart <span class="cart-badge" id="cart-count">0</span></a>`;
    html += `<a href="login.html">Login</a>`;
    html += `<a href="register.html">Register</a>`;
  }
  nav.innerHTML = html;
  updateCartBadge();
}

function escapeHtml(str) { const d = document.createElement("div"); d.textContent = str; return d.innerHTML; }
function formatMoney(amount) { return "$" + Number(amount).toFixed(2); }
function requireLogin() { if (!isLoggedIn()) window.location.href = "login.html"; }
function requireAdmin() { if (!isLoggedIn() || !isAdmin()) window.location.href = "index.html"; }

document.addEventListener("DOMContentLoaded", renderNavbar);
