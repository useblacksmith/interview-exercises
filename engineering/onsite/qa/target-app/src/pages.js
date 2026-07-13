const css = () => `
  :root {
    --app-background: #18191a;
    --surface: #1d1e20;
    --surface-hover: #252628;
    --surface-inset: #242526;
    --border: #39393b;
    --focus-border: #c0c920;
    --foreground: #ffffff;
    --muted-foreground: #a3a3a3;
    --icon-secondary: #dddddd;
    --accent: #dfe93b;
    --brand-yellow: #f0fb29;
    --font-display: "IBM Plex Sans", system-ui, sans-serif;
    --font-sans: "Inter", system-ui, sans-serif;
  }
  * { box-sizing: border-box; }
  body { font-family: var(--font-sans); font-size: 14px; line-height: 1.5; margin: 0; background: var(--app-background); color: var(--foreground); -webkit-font-smoothing: antialiased; }
  nav { display: flex; gap: 1.25rem; align-items: center; height: 56px; padding: 0 2rem; background: var(--surface); border-bottom: 1px solid var(--border); }
  nav .brand { font-family: var(--font-display); font-weight: 600; font-size: 15px; color: var(--foreground); margin-right: 1.25rem; display: inline-flex; align-items: center; gap: .5rem; }
  nav .brand::before { content: ""; width: 10px; height: 10px; border-radius: 2px; background: var(--brand-yellow); }
  nav a { color: var(--muted-foreground); text-decoration: none; font-size: 13px; padding: .3rem .6rem; border-radius: 6px; }
  nav a:hover { color: var(--foreground); background: rgba(255, 255, 255, 0.06); }
  main { max-width: 960px; margin: 2.5rem auto; padding: 0 1.5rem; }
  h1 { font-family: var(--font-display); font-weight: 500; font-size: 24px; letter-spacing: -0.01em; color: var(--foreground); margin: 0 0 1rem; }
  h2 { font-family: var(--font-display); font-weight: 500; font-size: 17px; color: var(--foreground); }
  p { color: var(--muted-foreground); }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 1.25rem; display: flex; flex-direction: column; gap: .5rem; }
  .card:hover { background: var(--surface-hover); }
  .card .emoji { font-size: 1.75rem; }
  .card strong { color: var(--foreground); font-weight: 500; }
  .card .price { color: var(--accent); font-weight: 500; font-variant-numeric: tabular-nums; }
  .card span { color: var(--muted-foreground); }
  .card a { color: var(--foreground); text-decoration: none; font-size: 13px; margin-top: .25rem; }
  .card a:hover { text-decoration: underline; }
  .price { color: var(--accent); font-weight: 500; font-variant-numeric: tabular-nums; }
  button, .btn { display: inline-flex; align-items: center; justify-content: center; height: 32px; padding: 0 14px; background: #f5f5f5; color: #000; border: 2px solid transparent; border-radius: 999px; font-family: var(--font-sans); font-weight: 400; font-size: 13px; cursor: pointer; text-decoration: none; transition: none; }
  button:hover, .btn:hover { background: #ffffff; color: #000; }
  button:focus-visible, .btn:focus-visible { outline: none; border-color: var(--focus-border); }
  button:disabled { background: #313435; color: #868686; border: 1px solid var(--border); cursor: not-allowed; }
  input, select { background: var(--surface-inset); border: 1px solid var(--border); color: var(--foreground); border-radius: 6px; padding: .5rem .75rem; width: 100%; font-family: var(--font-sans); font-size: 13px; }
  input::placeholder { color: #737373; }
  input:focus-visible, select:focus-visible { outline: none; border-color: var(--focus-border); }
  label { display: block; margin: 1rem 0 .35rem; color: var(--muted-foreground); font-size: 13px; }
  form { max-width: 420px; }
  .toast { position: fixed; bottom: 1.5rem; right: 1.5rem; background: #2a2c2c; box-shadow: 0 0 0 1px #444545; color: var(--foreground); padding: .75rem 1.1rem; border-radius: 8px; font-size: 13px; display: none; }
  .toast::before { content: ""; display: inline-block; width: 8px; height: 8px; border-radius: 999px; background: #34c5a1; margin-right: .6rem; }
  .toast.error::before { background: #ff5081; }
  .toast.show { display: block; }
  .steps { display: flex; gap: .5rem; margin-bottom: 1.5rem; }
  .steps span { padding: .3rem .85rem; border-radius: 999px; background: transparent; border: 1px solid var(--border); color: var(--muted-foreground); font-size: 13px; }
  .steps span.active { background: #f5f5f5; border-color: transparent; color: #000; font-weight: 500; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: .5rem .75rem; border-bottom: 1px solid var(--border); color: var(--muted-foreground); font-weight: 500; }
  td { text-align: left; padding: .55rem .75rem; border-bottom: 1px solid var(--border); color: var(--foreground); font-variant-numeric: tabular-nums; }
  .reviews { margin-top: 2rem; }
  .review { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: .9rem 1.1rem; margin-bottom: .6rem; color: var(--muted-foreground); }
  .review strong { color: var(--foreground); font-weight: 500; }
`;

export const layout = (version, title, body) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — Forgeboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>${css()}</style>
</head>
<body data-app-version="${version}">
<nav>
  <span class="brand">Forgeboard</span>
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
