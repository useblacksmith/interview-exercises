const css = () => `
  * { box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; margin: 0; background: #0f1115; color: #e6e6e6; }
  nav { display: flex; gap: 1.5rem; align-items: center; padding: 1rem 2rem; background: #171a21; border-bottom: 1px solid #2a2f3a; }
  nav .brand { font-weight: 700; color: #f0b429; margin-right: 1rem; }
  nav a { color: #9aa4b2; text-decoration: none; }
  nav a:hover { color: #fff; }
  main { max-width: 960px; margin: 2rem auto; padding: 0 1.5rem; }
  h1 { color: #fff; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
  .card { background: #171a21; border: 1px solid #2a2f3a; border-radius: 10px; padding: 1.25rem; display: flex; flex-direction: column; gap: .5rem; }
  .card .emoji { font-size: 2rem; }
  .card .price { color: #f0b429; font-weight: 600; }
  .card a { color: #7cc4ff; text-decoration: none; }
  button, .btn { background: #f0b429; color: #171a21; border: none; border-radius: 8px; padding: .7rem 1.2rem; font-weight: 600; cursor: pointer; font-size: 1rem; }
  button:disabled { opacity: .5; cursor: not-allowed; }
  input, select { background: #0f1115; border: 1px solid #2a2f3a; color: #e6e6e6; border-radius: 8px; padding: .7rem; width: 100%; font-size: 1rem; }
  label { display: block; margin: 1rem 0 .35rem; color: #9aa4b2; }
  form { max-width: 420px; }
  .toast { position: fixed; bottom: 1.5rem; right: 1.5rem; background: #1d7a3e; color: #fff; padding: 1rem 1.5rem; border-radius: 8px; display: none; }
  .toast.error { background: #a13333; }
  .toast.show { display: block; }
  .steps { display: flex; gap: .75rem; margin-bottom: 1.5rem; }
  .steps span { padding: .4rem .9rem; border-radius: 999px; background: #171a21; border: 1px solid #2a2f3a; color: #9aa4b2; }
  .steps span.active { background: #f0b429; color: #171a21; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: .6rem .75rem; border-bottom: 1px solid #2a2f3a; }
  .reviews { margin-top: 2rem; }
  .review { background: #171a21; border: 1px solid #2a2f3a; border-radius: 8px; padding: .9rem 1.1rem; margin-bottom: .75rem; }
`;

export const layout = (version, title, body) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — Forgeboard</title>
<style>${css()}</style>
</head>
<body data-app-version="${version}">
<nav>
  <span class="brand">⚒️ Forgeboard</span>
  <a href="/">Home</a>
  <a href="/products">Products</a>
  <a href="/signup">Sign up</a>
  <a href="/checkout">Checkout</a>
  <a href="/admin/orders">Orders</a>
</nav>
<main>${body}</main>
<div class="toast" id="toast" role="status"></div>
<script>
function toast(msg, isError) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => t.classList.remove('show'), 4000);
}
</script>
</body>
</html>`;

export const homePage = (version) => `
<h1>Gear for people who build.</h1>
<p>Forgeboard is the storefront for the modern smithy. Browse the catalog, sign up for restock alerts, and check out in three steps.</p>
<p><a class="btn" href="/products">Browse products</a></p>
`;

export const productsPage = (products, visualBug) => {
  const cards = products
    .map(
      (p) => `<div class="card">
  <span class="emoji">${p.emoji}</span>
  <strong>${p.name}</strong>
  <span class="price">$${p.price}</span>
  <span>${p.desc}</span>
  <a href="/products/${p.id}" data-testid="product-link-${p.id}">View details →</a>
</div>`
    )
    .join("\n");
  return `${visualBug ? `<style>
  .grid { display: block; }
  .card { width: 130%; margin-bottom: -6px; }
  .card .price { position: absolute; margin-left: 480px; }
</style>` : ""}
<h1>Products</h1>
<div class="grid">${cards}</div>`;
};

export const productDetailPage = (product, networkBug) => `
<h1>${product.emoji} ${product.name}</h1>
<p class="price" style="font-size:1.4rem">$${product.price}</p>
<p>${product.desc}</p>
<div class="reviews">
  <h2>Reviews</h2>
  <div id="reviews">Loading reviews…</div>
</div>
<script>
async function loadReviews() {
  const res = await fetch('/api/products/${product.id}/reviews');
  const data = await res.json();
  document.getElementById('reviews').innerHTML = data.reviews
    .map(r => '<div class="review"><strong>' + r.author + '</strong> — ' + '★'.repeat(r.rating) + '<br>' + r.text + '</div>')
    .join('');
}
loadReviews();
${networkBug ? `
loadReviews(); // fires a second identical request
try { window.analytics.track('product_view', { id: ${product.id} }); } catch (e) { console.error('analytics failed to initialize', e); }
window.analytics.track('product_view_confirmed', { id: ${product.id} });
` : ""}
</script>
`;

export const signupPage = () => `
<h1>Sign up</h1>
<p>Create an account to get restock alerts. We'll send a confirmation email.</p>
<form id="signup-form">
  <label for="name">Name</label>
  <input id="name" name="name" placeholder="Wayland Smith">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" placeholder="you@example.com" required>
  <p><button type="submit" data-testid="signup-submit">Create account</button></p>
</form>
<script>
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = { name: document.getElementById('name').value, email: document.getElementById('email').value };
  const res = await fetch('/api/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json();
  if (res.ok) toast(data.message); else toast(data.error || 'Something went wrong', true);
});
</script>
`;

export const checkoutPage = (products, resilienceBug) => `
<h1>Checkout</h1>
<div class="steps"><span id="s1" class="active">1. Cart</span><span id="s2">2. Shipping</span><span id="s3">3. Confirm</span></div>
<div id="step-1">
  <label for="product">Product</label>
  <select id="product">${products.map((p) => `<option value="${p.id}">${p.name} — $${p.price}</option>`).join("")}</select>
  <label for="qty">Quantity</label>
  <input id="qty" type="number" value="1" min="1">
  <p><button onclick="next(2)" data-testid="to-shipping">Continue to shipping</button></p>
</div>
<div id="step-2" style="display:none">
  <label for="address">Shipping address</label>
  <input id="address" placeholder="1 Forge Lane, Hammerfell">
  <label for="speed">Speed</label>
  <select id="speed"><option>Standard (5 days)</option><option>Express (2 days)</option></select>
  <p><button onclick="next(3)" data-testid="to-confirm">Continue to confirm</button></p>
</div>
<div id="step-3" style="display:none">
  <p id="summary"></p>
  <p><button id="place" onclick="placeOrder()" data-testid="place-order">Place order</button></p>
  <p id="result"></p>
</div>
<script>
const persist = ${resilienceBug ? "false" : "true"};
const dedupe = ${resilienceBug ? "false" : "true"};
let state = { step: 1, productId: 1, qty: 1, address: '', speed: '' };
if (persist) {
  const saved = sessionStorage.getItem('checkout');
  if (saved) { state = JSON.parse(saved); restore(); }
}
function save() { if (persist) sessionStorage.setItem('checkout', JSON.stringify(state)); }
function restore() {
  document.getElementById('product').value = state.productId;
  document.getElementById('qty').value = state.qty;
  document.getElementById('address').value = state.address;
  show(state.step);
}
function show(n) {
  for (let i = 1; i <= 3; i++) {
    document.getElementById('step-' + i).style.display = i === n ? 'block' : 'none';
    document.getElementById('s' + i).classList.toggle('active', i === n);
  }
  if (n === 3) {
    const opt = document.querySelector('#product option[value="' + state.productId + '"]');
    document.getElementById('summary').textContent = state.qty + ' × ' + opt.textContent + ' → ' + state.address + ' (' + state.speed + ')';
  }
}
function next(n) {
  state.productId = Number(document.getElementById('product').value);
  state.qty = Number(document.getElementById('qty').value);
  state.address = document.getElementById('address').value;
  state.speed = document.getElementById('speed').value;
  if (n === 3 && !state.address) { toast('Shipping address required', true); return; }
  state.step = n;
  save();
  show(n);
}
let orderKey = 'key-' + Math.random().toString(36).slice(2);
async function placeOrder() {
  const btn = document.getElementById('place');
  if (dedupe) btn.disabled = true;
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [{ productId: state.productId, qty: state.qty }], shipping: { address: state.address, speed: state.speed }, idempotencyKey: dedupe ? orderKey : undefined })
  });
  const data = await res.json();
  if (res.ok) {
    document.getElementById('result').textContent = 'Order placed: ' + data.orderId;
    toast('Order placed: ' + data.orderId);
    if (persist) sessionStorage.removeItem('checkout');
  } else {
    toast(data.error || 'Order failed', true);
    btn.disabled = false;
  }
}
</script>
`;

export const ordersAdminPage = (orders) => `
<h1>Orders</h1>
${orders.length === 0 ? "<p>No orders yet.</p>" : `<table>
<tr><th>ID</th><th>Items</th><th>Address</th><th>Total</th><th>At</th></tr>
${orders.map((o) => `<tr><td>${o.id}</td><td>${o.items.map((i) => i.productId + "×" + (i.qty || 1)).join(", ")}</td><td>${o.shipping.address}</td><td>$${o.total}</td><td>${o.at}</td></tr>`).join("")}
</table>`}
`;
