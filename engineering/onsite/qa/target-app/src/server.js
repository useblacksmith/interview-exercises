import express from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { products } from "./data.js";
import { layout, landingPage, productsPage, productDetailPage, signupPage, loginPage, cartPage, checkoutPage, ordersPage } from "./pages.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const VERSION = process.env.APP_VERSION === "v2" ? "v2" : "v1";
const isV2 = VERSION === "v2";
const flag = (name, def) => (process.env[name] !== undefined ? process.env[name] === "1" : def);

// Fault knobs: default on in v2, off in v1. Override individually via env.
const BUGS = {
  perf: flag("BUG_PERF", isV2),          // slow /products page
  visual: flag("BUG_VISUAL", isV2),      // broken product card layout
  email: flag("BUG_EMAIL", isV2),        // signup succeeds but email never sends
  network: flag("BUG_NETWORK", isV2),    // console error + duplicate API call on product detail
  resilience: flag("BUG_RESILIENCE", isV2) // checkout loses state on refresh; double-submit double-orders
};
const PERF_DELAY_MS = parseInt(process.env.PERF_DELAY_MS || "2000", 10);

const mailer = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "localhost",
  port: parseInt(process.env.MAIL_PORT || "1025", 10),
  secure: false
});

// In-memory state. Seeded demo user so the app is usable without signing up.
const users = [{ email: "wayland@forgeboard.dev", name: "Wayland Smith", password: "anvil123" }];
const sessions = new Map(); // token -> { email, cart: [{productId, qty}] }
const orders = [];
const signups = [];
const captchas = new Map(); // id -> { solved, createdAt }
const CAPTCHA_TTL_MS = 5 * 60 * 1000;
const CAPTCHA_TRACK_MAX = 240; // must match MAX in pages.js slider track
const CAPTCHA_MAX_STEP = 40; // largest allowed jump between consecutive pointer samples
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const parseCookies = (req) =>
  Object.fromEntries((req.headers.cookie || "").split(";").map((c) => c.trim().split("=")).filter((p) => p.length === 2));

app.use((req, res, next) => {
  const token = parseCookies(req).fb_session;
  req.session = token ? sessions.get(token) : undefined;
  next();
});

const requireLogin = (req, res, next) => {
  if (!req.session) return res.redirect("/login?next=" + encodeURIComponent(req.originalUrl));
  next();
};
const requireApiLogin = (req, res, next) => {
  if (!req.session) return res.status(401).json({ error: "not logged in" });
  next();
};
const cartCount = (req) => (req.session ? req.session.cart.reduce((n, it) => n + it.qty, 0) : 0);
const page = (req, title, body) => layout(VERSION, title, body, { user: req.session?.email, cartCount: cartCount(req) });

// ---------- pages ----------

app.get("/", (req, res) => res.send(page(req, "Home", landingPage(products, !!req.session))));

app.get("/products", async (req, res) => {
  if (BUGS.perf) await sleep(PERF_DELAY_MS);
  res.send(page(req, "Products", productsPage(products, BUGS.visual, !!req.session)));
});

app.get("/products/:id", (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).send(page(req, "Not found", "<h1>Not found</h1>"));
  res.send(page(req, product.name, productDetailPage(product, BUGS.network, !!req.session)));
});

app.get("/signup", (req, res) => res.send(page(req, "Sign up", signupPage())));
app.get("/login", (req, res) => {
  const next = typeof req.query.next === "string" && /^\/(?!\/)/.test(req.query.next) ? req.query.next : "/products";
  if (req.query.captcha === "1") res.setHeader("Set-Cookie", "fb_captcha=1; Path=/; HttpOnly; SameSite=Lax");
  const captchaRequired = req.query.captcha === "1" || parseCookies(req).fb_captcha === "1";
  res.send(page(req, "Log in", loginPage(next, captchaRequired)));
});
app.get("/cart", requireLogin, (req, res) => res.send(page(req, "Cart", cartPage())));
app.get("/checkout", requireLogin, (req, res) => {
  if (req.session.cart.length === 0) return res.redirect("/cart");
  res.send(page(req, "Checkout", checkoutPage(BUGS.resilience)));
});
app.get("/orders", requireLogin, (req, res) =>
  res.send(page(req, "Orders", ordersPage(orders.filter((o) => o.email === req.session.email), products)))
);

// ---------- auth ----------

app.post("/api/signup", async (req, res) => {
  const { email, name, password } = req.body || {};
  if (!email || !email.includes("@")) return res.status(400).json({ error: "valid email required" });
  if (!password || password.length < 6) return res.status(400).json({ error: "password of 6+ characters required" });
  if (users.find((u) => u.email === email)) return res.status(409).json({ error: "an account with that email already exists" });
  if (!BUGS.email) {
    try {
      await mailer.sendMail({
        from: "welcome@forgeboard.dev",
        to: email,
        subject: "Welcome to Forgeboard",
        text: `Hi ${name || "there"},\n\nYour Forgeboard account is ready. Confirm your email to get started.\n\n— The Forgeboard team`
      });
    } catch (err) {
      console.error("mail send failed:", err.message);
      return res.status(502).json({ error: "email delivery failed" });
    }
  }
  if (users.find((u) => u.email === email)) return res.status(409).json({ error: "an account with that email already exists" });
  users.push({ email, name, password });
  signups.push({ email, name, at: new Date().toISOString() });
  res.json({ ok: true, message: "Account created! Check your email to confirm." });
});

app.post("/api/login", (req, res) => {
  const { email, password, captchaId } = req.body || {};
  const captchaRequired = parseCookies(req).fb_captcha === "1";
  if (captchaRequired) {
    const challenge = captchas.get(captchaId);
    captchas.delete(captchaId); // single use
    const fresh = challenge && Date.now() - challenge.createdAt < CAPTCHA_TTL_MS;
    if (!fresh || !challenge.solved) {
      return res.status(401).json({ error: "CAPTCHA verification failed: complete the slider challenge" });
    }
  }
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "invalid email or password" });
  const token = crypto.randomBytes(16).toString("hex");
  sessions.set(token, { email: user.email, cart: [] });
  const cookies = [`fb_session=${token}; Path=/; HttpOnly; SameSite=Lax`];
  if (captchaRequired) cookies.push("fb_captcha=; Path=/; Max-Age=0");
  res.setHeader("Set-Cookie", cookies);
  res.json({ ok: true, email: user.email });
});

// ---------- captcha ----------
// Slide-to-verify challenge. Solving requires a real pointer drag (mousedown,
// continuous mousemove, mouseup) on the handle; a click or a form fill cannot
// complete it. The solved flag lives server-side and is checked at login.

app.get("/api/captcha/new", (req, res) => {
  const id = crypto.randomBytes(8).toString("hex");
  captchas.set(id, { solved: false, createdAt: Date.now() });
  res.json({ id });
});

app.post("/api/captcha/verify", (req, res) => {
  const { captchaId, samples } = req.body || {};
  const challenge = captchas.get(captchaId);
  if (!challenge || Date.now() - challenge.createdAt > CAPTCHA_TTL_MS) {
    return res.status(400).json({ error: "unknown or expired challenge" });
  }
  // Require drag telemetry: a run of intermediate pointer positions ending at the
  // right edge, each step no larger than a real drag could produce (rejects jumps
  // and fabricated sample arrays that skip the actual pointer movement).
  const isValidDrag =
    Array.isArray(samples) &&
    samples.length >= 8 &&
    samples.every((n) => typeof n === "number" && Number.isFinite(n)) &&
    samples[0] <= 20 &&
    samples[samples.length - 1] >= CAPTCHA_TRACK_MAX - 4 &&
    samples.every((n, i) => i === 0 || (n - samples[i - 1] >= -5 && n - samples[i - 1] <= CAPTCHA_MAX_STEP));
  if (!isValidDrag) {
    return res.status(400).json({ error: "challenge not completed" });
  }
  challenge.solved = true;
  res.json({ ok: true });
});

app.post("/api/logout", (req, res) => {
  const token = parseCookies(req).fb_session;
  if (token) sessions.delete(token);
  res.setHeader("Set-Cookie", "fb_session=; Path=/; Max-Age=0");
  res.json({ ok: true });
});

// ---------- cart ----------

app.get("/api/cart", requireApiLogin, (req, res) => {
  const items = req.session.cart.map((it) => {
    const p = products.find((x) => x.id === it.productId);
    return { ...it, name: p.name, price: p.price, emoji: p.emoji, subtotal: p.price * it.qty };
  });
  res.json({ items, total: items.reduce((s, it) => s + it.subtotal, 0), count: cartCount(req) });
});

app.post("/api/cart", requireApiLogin, (req, res) => {
  const { productId, qty = 1 } = req.body || {};
  const product = products.find((p) => p.id === Number(productId));
  if (!product) return res.status(400).json({ error: "unknown product" });
  const n = Math.max(1, Number(qty) || 1);
  const existing = req.session.cart.find((it) => it.productId === product.id);
  if (existing) existing.qty += n;
  else req.session.cart.push({ productId: product.id, qty: n });
  res.json({ ok: true, count: cartCount(req) });
});

app.patch("/api/cart/:productId", requireApiLogin, (req, res) => {
  const item = req.session.cart.find((it) => it.productId === Number(req.params.productId));
  if (!item) return res.status(404).json({ error: "not in cart" });
  const n = Number(req.body?.qty);
  if (!Number.isFinite(n) || n < 0) return res.status(400).json({ error: "qty must be a non-negative number" });
  if (n === 0) req.session.cart = req.session.cart.filter((it) => it !== item);
  else item.qty = n;
  res.json({ ok: true, count: cartCount(req) });
});

app.delete("/api/cart/:productId", requireApiLogin, (req, res) => {
  req.session.cart = req.session.cart.filter((it) => it.productId !== Number(req.params.productId));
  res.json({ ok: true, count: cartCount(req) });
});

// ---------- reviews ----------

app.get("/api/products/:id/reviews", async (req, res) => {
  await sleep(150);
  res.json({ productId: Number(req.params.id), reviews: [{ author: "smith42", rating: 5, text: "Solid." }, { author: "forgemaster", rating: 4, text: "Does the job." }] });
});

// ---------- orders ----------

app.post("/api/orders", requireApiLogin, async (req, res) => {
  const { shipping, idempotencyKey } = req.body || {};
  if (!shipping?.address) return res.status(400).json({ error: "shipping address required" });
  if (req.session.cart.length === 0) return res.status(400).json({ error: "cart is empty" });
  const items = req.session.cart.map((it) => ({ ...it }));
  await sleep(400);
  // Dedupe check runs synchronously with the push (no await in between), so
  // concurrent requests with the same key cannot both pass the lookup.
  if (!BUGS.resilience && idempotencyKey) {
    const existing = orders.find((o) => o.idempotencyKey === idempotencyKey);
    if (existing) return res.json({ ok: true, orderId: existing.id, duplicate: true });
  }
  const total = items.reduce((sum, it) => {
    const p = products.find((x) => x.id === it.productId);
    return sum + (p ? p.price * it.qty : 0);
  }, 0);
  const id = `ORD-${1000 + orders.length}`;
  orders.push({ id, email: req.session.email, items, shipping, total, idempotencyKey, at: new Date().toISOString() });
  req.session.cart = [];
  res.json({ ok: true, orderId: id, total });
});

app.get("/api/orders", (req, res) => res.json({ orders }));
app.get("/api/signups", (req, res) => res.json({ signups }));
app.get("/healthz", (req, res) => res.json({ ok: true, version: VERSION }));

const port = parseInt(process.env.PORT || "3000", 10);
app.listen(port, () => console.log(`forgeboard ${VERSION} listening on :${port} bugs=${JSON.stringify(BUGS)}`));
