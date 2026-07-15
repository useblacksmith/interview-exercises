const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

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
    --accent: #dfe93b;
    --brand-yellow: #f0fb29;
    --font-display: "IBM Plex Sans", system-ui, sans-serif;
    --font-sans: "Inter", system-ui, sans-serif;
  }
  * { box-sizing: border-box; }
  body { font-family: var(--font-sans); font-size: 14px; line-height: 1.5; margin: 0; background: var(--app-background); color: var(--foreground); -webkit-font-smoothing: antialiased; }
  nav { display: flex; gap: .25rem; align-items: center; height: 56px; padding: 0 2rem; background: var(--surface); border-bottom: 1px solid var(--border); }
  nav .brand { font-family: var(--font-display); font-weight: 600; font-size: 15px; color: var(--foreground); margin-right: 1.5rem; display: inline-flex; align-items: center; gap: .5rem; text-decoration: none; }
  nav .brand::before { content: ""; width: 10px; height: 10px; border-radius: 2px; background: var(--brand-yellow); }
  nav a { color: var(--muted-foreground); text-decoration: none; font-size: 13px; padding: .3rem .6rem; border-radius: 6px; }
  nav a:hover { color: var(--foreground); background: rgba(255, 255, 255, 0.06); }
  nav .spacer { flex: 1; }
  nav .user { color: var(--muted-foreground); font-size: 12px; margin-right: .5rem; }
  nav .cart-link { position: relative; }
  nav .cart-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 16px; height: 16px; padding: 0 4px; margin-left: .35rem; border-radius: 999px; background: var(--brand-yellow); color: #000; font-size: 10px; font-weight: 600; vertical-align: 1px; }
  main { max-width: 1024px; margin: 2.5rem auto; padding: 0 1.5rem; }
  h1 { font-family: var(--font-display); font-weight: 500; font-size: 24px; letter-spacing: -0.01em; color: var(--foreground); margin: 0 0 .5rem; }
  h2 { font-family: var(--font-display); font-weight: 500; font-size: 17px; color: var(--foreground); }
  p { color: var(--muted-foreground); }
  .subtitle { margin: 0 0 1.75rem; }
  .hero { padding: 4.5rem 0 3.5rem; max-width: 620px; }
  .hero h1 { font-size: 40px; line-height: 1.15; letter-spacing: -0.02em; margin-bottom: 1rem; }
  .hero p { font-size: 15px; margin-bottom: 1.75rem; }
  .hero .actions { display: flex; gap: .75rem; }
  .eyebrow { display: inline-flex; align-items: center; gap: .5rem; font-size: 12px; color: var(--accent); border: 1px solid var(--border); border-radius: 999px; padding: .2rem .75rem; margin-bottom: 1.25rem; }
  .section-head { display: flex; align-items: baseline; justify-content: space-between; margin: 2.5rem 0 1rem; }
  .section-head a { color: var(--muted-foreground); font-size: 13px; text-decoration: none; }
  .section-head a:hover { color: var(--foreground); }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; }
  .card:hover { background: var(--surface-hover); }
  .card .thumb { display: flex; align-items: center; justify-content: center; height: 110px; font-size: 2.25rem; background: linear-gradient(160deg, #242526 0%, #1d1e20 100%); border-bottom: 1px solid var(--border); }
  .card .body { display: flex; flex-direction: column; gap: .4rem; padding: 1rem 1.1rem 1.1rem; flex: 1; }
  .card .title-row { display: flex; align-items: baseline; justify-content: space-between; gap: .5rem; }
  .card strong { color: var(--foreground); font-weight: 500; }
  .card .desc { color: var(--muted-foreground); font-size: 13px; flex: 1; }
  .card .foot { display: flex; align-items: center; justify-content: space-between; margin-top: .75rem; }
  .card .foot a { color: var(--muted-foreground); text-decoration: none; font-size: 13px; }
  .card .foot a:hover { color: var(--foreground); text-decoration: underline; }
  .price { color: var(--accent); font-weight: 500; font-variant-numeric: tabular-nums; }
  button, .btn { display: inline-flex; align-items: center; justify-content: center; height: 32px; padding: 0 14px; background: #f5f5f5; color: #000; border: 2px solid transparent; border-radius: 999px; font-family: var(--font-sans); font-weight: 400; font-size: 13px; cursor: pointer; text-decoration: none; transition: none; }
  button:hover, .btn:hover { background: #ffffff; color: #000; }
  button:focus-visible, .btn:focus-visible { outline: none; border-color: var(--focus-border); }
  button:disabled { background: #313435; color: #868686; border: 1px solid var(--border); cursor: not-allowed; }
  .btn-secondary { background: transparent; color: var(--foreground); border: 1px solid var(--border); }
  .btn-secondary:hover { background: rgba(255,255,255,0.06); color: var(--foreground); }
  .btn-sm { height: 26px; padding: 0 10px; font-size: 12px; }
  input, select { background: var(--surface-inset); border: 1px solid var(--border); color: var(--foreground); border-radius: 6px; padding: .5rem .75rem; width: 100%; font-family: var(--font-sans); font-size: 13px; }
  input::placeholder { color: #737373; }
  input:focus-visible, select:focus-visible { outline: none; border-color: var(--focus-border); }
  label { display: block; margin: 1rem 0 .35rem; color: var(--muted-foreground); font-size: 13px; }
  form.auth, .panel { max-width: 400px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 1.5rem 1.75rem 1.75rem; }
  .hint { font-size: 12px; color: #737373; margin-top: 1rem; }
  .hint code { color: var(--muted-foreground); background: var(--surface-inset); border: 1px solid var(--border); border-radius: 4px; padding: 1px 5px; }
  .toast { position: fixed; bottom: 1.5rem; right: 1.5rem; background: #2a2c2c; box-shadow: 0 0 0 1px #444545; color: var(--foreground); padding: .75rem 1.1rem; border-radius: 8px; font-size: 13px; display: none; z-index: 10; }
  .toast::before { content: ""; display: inline-block; width: 8px; height: 8px; border-radius: 999px; background: #34c5a1; margin-right: .6rem; }
  .toast.error::before { background: #ff5081; }
  .toast.show { display: block; }
  .steps { display: flex; gap: .5rem; margin-bottom: 1.5rem; }
  .steps span { padding: .3rem .85rem; border-radius: 999px; background: transparent; border: 1px solid var(--border); color: var(--muted-foreground); font-size: 13px; }
  .steps span.active { background: #f5f5f5; border-color: transparent; color: #000; font-weight: 500; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: .5rem .75rem; border-bottom: 1px solid var(--border); color: var(--muted-foreground); font-weight: 500; }
  td { text-align: left; padding: .55rem .75rem; border-bottom: 1px solid var(--border); color: var(--foreground); font-variant-numeric: tabular-nums; }
  .qty-controls { display: inline-flex; align-items: center; gap: .5rem; }
  .qty-controls button { height: 24px; width: 24px; padding: 0; border-radius: 6px; background: var(--surface-inset); color: var(--foreground); border: 1px solid var(--border); font-size: 13px; }
  .qty-controls button:hover { background: var(--surface-hover); color: var(--foreground); }
  .cart-summary { display: flex; align-items: center; justify-content: space-between; margin-top: 1.5rem; }
  .cart-summary .total { font-size: 16px; }
  .empty { border: 1px dashed var(--border); border-radius: 10px; padding: 2.5rem; text-align: center; color: var(--muted-foreground); }
  .reviews { margin-top: 2rem; }
  .review { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: .9rem 1.1rem; margin-bottom: .6rem; color: var(--muted-foreground); }
  .review strong { color: var(--foreground); font-weight: 500; }
  .detail { display: grid; grid-template-columns: 300px 1fr; gap: 2rem; align-items: start; }
  .detail .thumb { display: flex; align-items: center; justify-content: center; height: 220px; font-size: 4rem; background: linear-gradient(160deg, #242526 0%, #1d1e20 100%); border: 1px solid var(--border); border-radius: 10px; }
  .detail .buy { display: flex; align-items: center; gap: .75rem; margin-top: 1.25rem; }
  .detail .buy input { width: 64px; }
`;

export const layout = (version, title, body, { user, cartCount = 0 } = {}) => `<!doctype html>
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
  <a class="brand" href="/">Forgeboard</a>
  <a href="/products">Products</a>
  ${user ? `<a href="/orders">Orders</a>` : ""}
  <span class="spacer"></span>
  ${user
    ? `<a class="cart-link" href="/cart" data-testid="nav-cart">Cart${cartCount ? `<span class="cart-badge" data-testid="cart-count">${cartCount}</span>` : ""}</a>
  <span class="user">${esc(user)}</span>
  <a href="#" id="logout" data-testid="nav-logout">Log out</a>`
    : `<a href="/login" data-testid="nav-login">Log in</a>
  <a href="/signup" data-testid="nav-signup">Sign up</a>`}
</nav>
<main>${body}</main>
<div class="toast" id="toast" role="status"></div>
<script>
let toastTimer;
function toast(msg, isError) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (isError ? ' error' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 4000);
}
async function addToCart(productId, qty) {
  const res = await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, qty: qty || 1 }) });
  if (res.status === 401) { location.href = '/login?next=' + encodeURIComponent(location.pathname); return; }
  const data = await res.json();
  if (res.ok) { toast('Added to cart'); updateCartBadge(data.count); }
  else toast(data.error || 'Could not add to cart', true);
}
function updateCartBadge(count) {
  const link = document.querySelector('[data-testid="nav-cart"]');
  if (!link) return;
  let badge = link.querySelector('.cart-badge');
  if (count > 0) {
    if (!badge) { badge = document.createElement('span'); badge.className = 'cart-badge'; badge.dataset.testid = 'cart-count'; link.appendChild(badge); }
    badge.textContent = count;
  } else if (badge) badge.remove();
}
const logoutLink = document.getElementById('logout');
if (logoutLink) logoutLink.addEventListener('click', async (e) => {
  e.preventDefault();
  await fetch('/api/logout', { method: 'POST' });
  location.href = '/';
});
</script>
</body>
</html>`;

export const landingPage = (products, loggedIn) => `
<div class="hero">
  <span class="eyebrow">Now shipping: the Winter forge collection</span>
  <h1>Gear for people who build.</h1>
  <p>Forgeboard is the storefront for the modern smithy. Browse the catalog, keep a cart across your session, and check out in a couple of clicks. Sign up to get restock alerts by email.</p>
  <div class="actions">
    <a class="btn" href="/products" data-testid="browse-products">Browse products</a>
    ${loggedIn ? "" : `<a class="btn btn-secondary" href="/signup">Create an account</a>`}
  </div>
</div>
<div class="section-head"><h2>Featured</h2><a href="/products">View all →</a></div>
<div class="grid">
${products.slice(0, 3).map((p) => `<div class="card">
  <div class="thumb">${p.emoji}</div>
  <div class="body">
    <div class="title-row"><strong>${p.name}</strong><span class="price">$${p.price}</span></div>
    <span class="desc">${p.desc}</span>
    <div class="foot"><a href="/products/${p.id}">Details →</a><button class="btn-sm" onclick="addToCart(${p.id})" data-testid="add-to-cart-${p.id}">Add to cart</button></div>
  </div>
</div>`).join("\n")}
</div>
`;

export const productsPage = (products, visualBug, loggedIn) => {
  const cards = products
    .map(
      (p) => `<div class="card">
  <div class="thumb">${p.emoji}</div>
  <div class="body">
    <div class="title-row"><strong>${p.name}</strong><span class="price">$${p.price}</span></div>
    <span class="desc">${p.desc}</span>
    <div class="foot"><a href="/products/${p.id}" data-testid="product-link-${p.id}">Details →</a><button class="btn-sm" onclick="addToCart(${p.id})" data-testid="add-to-cart-${p.id}">Add to cart</button></div>
  </div>
</div>`
    )
    .join("\n");
  return `${visualBug ? `<style>
  .grid { display: block; }
  .card { width: 130%; margin-bottom: -6px; }
  .card .price { position: absolute; margin-left: 480px; }
</style>` : ""}
<h1>Products</h1>
<p class="subtitle">Everything you need to run a modern forge.</p>
<div class="grid">${cards}</div>`;
};

export const productDetailPage = (product, networkBug, loggedIn) => `
<div class="detail">
  <div class="thumb">${product.emoji}</div>
  <div>
    <h1>${product.name}</h1>
    <p class="price" style="font-size:1.3rem">$${product.price}</p>
    <p>${product.desc}</p>
    <div class="buy">
      <input id="qty" type="number" value="1" min="1" aria-label="Quantity">
      <button onclick="addToCart(${product.id}, Number(document.getElementById('qty').value))" data-testid="add-to-cart-${product.id}">Add to cart</button>
    </div>
  </div>
</div>
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
<p class="subtitle">Create an account to shop and get restock alerts. We'll send a confirmation email.</p>
<form class="auth" id="signup-form">
  <label for="name">Name</label>
  <input id="name" name="name" placeholder="Wayland Smith">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" placeholder="you@example.com" required>
  <label for="password">Password</label>
  <input id="password" name="password" type="password" placeholder="6+ characters" required>
  <p><button type="submit" data-testid="signup-submit">Create account</button></p>
  <p class="hint">Already have an account? <a href="/login" style="color:inherit">Log in</a></p>
</form>
<script>
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.querySelector('[data-testid="signup-submit"]');
  btn.disabled = true;
  const body = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  };
  try {
    const res = await fetch('/api/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (res.ok) toast(data.message); else toast(data.error || 'Something went wrong', true);
  } finally {
    btn.disabled = false;
  }
});
</script>
`;

export const loginPage = (next, captchaRequired = false) => `
<h1>Log in</h1>
<p class="subtitle">Welcome back to the forge.</p>
<form class="auth" id="login-form">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" placeholder="you@example.com" required>
  <label for="password">Password</label>
  <input id="password" name="password" type="password" required>
  ${captchaRequired ? `
  <div id="captcha-block" data-testid="captcha-block" style="margin-top:12px">
    <label>Human verification: drag the slider all the way to the right</label>
    <div id="captcha-track" data-testid="captcha-track" style="position:relative;width:280px;height:44px;margin:8px 0;background:#1c1a17;border:1px solid #3a372f;border-radius:22px;user-select:none">
      <div id="captcha-fill" style="position:absolute;left:0;top:0;bottom:0;width:44px;background:#2e2b25;border-radius:22px"></div>
      <div id="captcha-label" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#8a857a;font-size:13px;pointer-events:none">Slide to verify &rarr;</div>
      <div id="captcha-handle" data-testid="captcha-handle" style="position:absolute;left:0;top:2px;width:40px;height:40px;background:#e8e4dc;border-radius:20px;cursor:grab;display:flex;align-items:center;justify-content:center;color:#1c1a17;font-weight:bold">&#8594;</div>
    </div>
  </div>` : `
  <p class="hint"><label style="cursor:pointer"><input type="checkbox" id="captcha-toggle" data-testid="captcha-toggle" style="width:auto;margin-right:6px">Protect this login with a CAPTCHA</label></p>`}
  <p><button type="submit" data-testid="login-submit">Log in</button></p>
  <p class="hint">Demo user: <code>wayland@forgeboard.dev</code> / <code>anvil123</code></p>
</form>
<script>
let captchaId = null;
let captchaSolved = false;
let captchaVerifyPromise = null;
async function loadCaptcha() {
  const res = await fetch('/api/captcha/new');
  const data = await res.json();
  captchaId = data.id;
  captchaSolved = false;
  const handle = document.getElementById('captcha-handle');
  handle.style.left = '0px';
  document.getElementById('captcha-fill').style.width = '44px';
  document.getElementById('captcha-label').textContent = 'Slide to verify \u2192';
  document.getElementById('captcha-track').style.borderColor = '#3a372f';
}
if (document.getElementById('captcha-block')) {
  loadCaptcha();
  const track = document.getElementById('captcha-track');
  const handle = document.getElementById('captcha-handle');
  const MAX = 240; // track 280 - handle 40
  let dragging = false, samples = [];
  handle.addEventListener('pointerdown', (e) => {
    if (captchaSolved) return;
    dragging = true; samples = [];
    handle.setPointerCapture(e.pointerId);
    handle.style.cursor = 'grabbing';
  });
  handle.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const rect = track.getBoundingClientRect();
    const x = Math.max(0, Math.min(MAX, e.clientX - rect.left - 20));
    samples.push(x);
    handle.style.left = x + 'px';
    document.getElementById('captcha-fill').style.width = (x + 44) + 'px';
  });
  handle.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    handle.style.cursor = 'grab';
    const x = parseFloat(handle.style.left) || 0;
    if (x >= MAX - 4) {
      captchaVerifyPromise = fetch('/api/captcha/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ captchaId, samples }) })
        .then((res) => {
          if (res.ok) {
            captchaSolved = true;
            document.getElementById('captcha-label').textContent = 'Verified \u2713';
            document.getElementById('captcha-track').style.borderColor = '#b8d44a';
          } else {
            loadCaptcha();
          }
        })
        .catch(() => {
          loadCaptcha();
        });
      return;
    }
    loadCaptcha();
  });
}
const toggle = document.getElementById('captcha-toggle');
if (toggle) toggle.addEventListener('change', () => {
  if (toggle.checked) location.href = '/login?captcha=1&next=' + encodeURIComponent(${JSON.stringify(next).replace(/</g, "\\u003c")});
});
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (document.getElementById('captcha-block')) {
    if (captchaVerifyPromise) await captchaVerifyPromise;
    if (!captchaSolved) {
      toast('Complete the slider verification before logging in', true);
      return;
    }
  }
  const body = { email: document.getElementById('email').value, password: document.getElementById('password').value };
  if (captchaId) body.captchaId = captchaId;
  const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json();
  if (res.ok) location.href = ${JSON.stringify(next).replace(/</g, "\\u003c")};
  else {
    toast(data.error || 'Login failed', true);
    if (document.getElementById('captcha-block')) {
      captchaSolved = false;
      captchaId = null;
      loadCaptcha();
    }
  }
});
</script>
`;

export const cartPage = () => `
<h1>Cart</h1>
<p class="subtitle">Items are kept on your account for this session.</p>
<div id="cart-root">Loading cart…</div>
<script>
async function renderCart() {
  const res = await fetch('/api/cart');
  const data = await res.json();
  const root = document.getElementById('cart-root');
  updateCartBadge(data.count);
  if (data.items.length === 0) {
    root.innerHTML = '<div class="empty">Your cart is empty. <a href="/products" style="color:inherit">Browse products</a></div>';
    return;
  }
  root.innerHTML = '<table data-testid="cart-table"><tr><th>Item</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr>' +
    data.items.map(it =>
      '<tr data-testid="cart-row-' + it.productId + '">' +
      '<td>' + it.emoji + ' ' + it.name + '</td>' +
      '<td>$' + it.price + '</td>' +
      '<td><span class="qty-controls">' +
        '<button onclick="setQty(' + it.productId + ',' + (it.qty - 1) + ')" data-testid="qty-dec-' + it.productId + '">−</button>' +
        '<span data-testid="qty-' + it.productId + '">' + it.qty + '</span>' +
        '<button onclick="setQty(' + it.productId + ',' + (it.qty + 1) + ')" data-testid="qty-inc-' + it.productId + '">+</button>' +
      '</span></td>' +
      '<td>$' + it.subtotal + '</td>' +
      '<td><button class="btn-sm btn-secondary" onclick="removeItem(' + it.productId + ')" data-testid="remove-' + it.productId + '">Remove</button></td>' +
      '</tr>'
    ).join('') +
    '</table>' +
    '<div class="cart-summary"><span class="total">Total: <span class="price" data-testid="cart-total">$' + data.total + '</span></span>' +
    '<a class="btn" href="/checkout" data-testid="to-checkout">Check out</a></div>';
}
async function setQty(productId, qty) {
  const res = await fetch('/api/cart/' + productId, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ qty }) });
  if (!res.ok) { const d = await res.json(); toast(d.error || 'Could not update cart', true); }
  renderCart();
}
async function removeItem(productId) {
  await fetch('/api/cart/' + productId, { method: 'DELETE' });
  toast('Removed from cart');
  renderCart();
}
renderCart();
</script>
`;

export const checkoutPage = (resilienceBug) => `
<h1>Checkout</h1>
<div class="steps"><span id="s1" class="active">1. Shipping</span><span id="s2">2. Confirm</span></div>
<div id="step-1" class="panel">
  <label for="address">Shipping address</label>
  <input id="address" placeholder="1 Forge Lane, Hammerfell">
  <label for="speed">Speed</label>
  <select id="speed"><option>Standard (5 days)</option><option>Express (2 days)</option></select>
  <p><button onclick="next(2)" data-testid="to-confirm">Continue to confirm</button></p>
</div>
<div id="step-2" class="panel" style="display:none">
  <h2 style="margin-top:0">Order summary</h2>
  <div id="summary">Loading…</div>
  <p id="ship-summary"></p>
  <p><button id="place" onclick="placeOrder()" data-testid="place-order">Place order</button></p>
  <p id="result" data-testid="order-result"></p>
</div>
<script>
const persist = ${resilienceBug ? "false" : "true"};
const dedupe = ${resilienceBug ? "false" : "true"};
let state = { step: 1, address: '', speed: '' };
if (persist) {
  const saved = sessionStorage.getItem('checkout');
  if (saved) { state = JSON.parse(saved); restore(); }
}
function save() { if (persist) sessionStorage.setItem('checkout', JSON.stringify(state)); }
function restore() {
  document.getElementById('address').value = state.address;
  if (state.speed) document.getElementById('speed').value = state.speed;
  show(state.step);
}
function show(n) {
  for (let i = 1; i <= 2; i++) {
    document.getElementById('step-' + i).style.display = i === n ? 'block' : 'none';
    document.getElementById('s' + i).classList.toggle('active', i === n);
  }
  if (n === 2) {
    document.getElementById('ship-summary').textContent = 'Ship to ' + state.address + ' — ' + state.speed;
    renderSummary();
  }
}
async function renderSummary() {
  const res = await fetch('/api/cart');
  const data = await res.json();
  document.getElementById('summary').innerHTML =
    data.items.map(it => '<div>' + it.qty + ' × ' + it.name + ' — $' + it.subtotal + '</div>').join('') +
    '<div style="margin-top:.5rem">Total: <span class="price">$' + data.total + '</span></div>';
}
function next(n) {
  state.address = document.getElementById('address').value;
  state.speed = document.getElementById('speed').value;
  if (n === 2 && !state.address) { toast('Shipping address required', true); return; }
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
    body: JSON.stringify({ shipping: { address: state.address, speed: state.speed }, idempotencyKey: dedupe ? orderKey : undefined })
  });
  const data = await res.json();
  if (res.ok) {
    document.getElementById('result').innerHTML = 'Order placed: ' + data.orderId + ' — <a href="/orders" style="color:inherit">view orders</a>';
    toast('Order placed: ' + data.orderId);
    updateCartBadge(0);
    if (persist) sessionStorage.removeItem('checkout');
  } else {
    toast(data.error || 'Order failed', true);
    btn.disabled = false;
  }
}
</script>
`;

export const ordersPage = (orders, products) => `
<h1>Orders</h1>
<p class="subtitle">Orders placed on this account.</p>
${orders.length === 0 ? `<div class="empty">No orders yet. <a href="/products" style="color:inherit">Browse products</a></div>` : `<table data-testid="orders-table">
<tr><th>ID</th><th>Items</th><th>Address</th><th>Total</th><th>Placed</th></tr>
${orders.map((o) => `<tr><td>${o.id}</td><td>${o.items.map((i) => {
  const p = products.find((x) => x.id === i.productId);
  return (p ? p.name : i.productId) + " × " + i.qty;
}).join(", ")}</td><td>${esc(o.shipping.address)}</td><td class="price">$${o.total}</td><td>${new Date(o.at).toLocaleString()}</td></tr>`).join("")}
</table>`}
`;
