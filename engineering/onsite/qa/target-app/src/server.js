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
const captchas = new Map(); // id -> { code, createdAt }
const CAPTCHA_TTL_MS = 5 * 60 * 1000;
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
  const { email, password, captchaId, captchaCode } = req.body || {};
  const captchaRequired = parseCookies(req).fb_captcha === "1";
  if (captchaRequired) {
    const challenge = captchas.get(captchaId);
    captchas.delete(captchaId); // single use
    const fresh = challenge && Date.now() - challenge.createdAt < CAPTCHA_TTL_MS;
    if (!fresh || challenge.code !== String(captchaCode || "").trim()) {
      return res.status(401).json({ error: "CAPTCHA verification failed" });
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
// The code is stored server-side only and rendered as SVG line segments,
// so it never appears as text in the DOM, the page source, or an API body.

const SEGMENTS = {
  a: [5, 5, 35, 5], b: [35, 5, 35, 35], c: [35, 35, 35, 65], d: [5, 65, 35, 65],
  e: [5, 35, 5, 65], f: [5, 5, 5, 35], g: [5, 35, 35, 35]
};
const DIGIT_SEGMENTS = {
  0: "abcdef", 1: "bc", 2: "abged", 3: "abgcd", 4: "fgbc",
  5: "afgcd", 6: "afgedc", 7: "abc", 8: "abcdefg", 9: "abfgcd"
};

const captchaSvg = (code) => {
  const jitter = () => (Math.random() - 0.5) * 6;
  const digits = [...code].map((d, i) => {
    const x = 15 + i * 50;
    const rot = (Math.random() - 0.5) * 24;
    const lines = [...DIGIT_SEGMENTS[d]].map((s) => {
      const [x1, y1, x2, y2] = SEGMENTS[s];
      return `<line x1="${x1 + jitter()}" y1="${y1 + jitter()}" x2="${x2 + jitter()}" y2="${y2 + jitter()}"/>`;
    }).join("");
    return `<g transform="translate(${x},15) rotate(${rot} 20 35)" stroke="#e8e4dc" stroke-width="4" stroke-linecap="round">${lines}</g>`;
  }).join("");
  const noise = Array.from({ length: 6 }, () => {
    const y1 = 10 + Math.random() * 80, y2 = 10 + Math.random() * 80;
    return `<line x1="0" y1="${y1}" x2="280" y2="${y2}" stroke="#6b675f" stroke-width="1.5"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="100" viewBox="0 0 280 100"><rect width="280" height="100" fill="#1c1a17" rx="8"/>${noise}${digits}</svg>`;
};

app.get("/api/captcha/new", (req, res) => {
  const id = crypto.randomBytes(8).toString("hex");
  const code = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join("");
  captchas.set(id, { code, createdAt: Date.now() });
  res.json({ id });
});

app.get("/api/captcha/:id.svg", (req, res) => {
  const challenge = captchas.get(req.params.id);
  if (!challenge) return res.status(404).send("unknown challenge");
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "no-store");
  res.send(captchaSvg(challenge.code));
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
