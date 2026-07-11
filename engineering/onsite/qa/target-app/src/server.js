import express from "express";
import nodemailer from "nodemailer";
import { products } from "./data.js";
import { layout, homePage, productsPage, productDetailPage, signupPage, checkoutPage, ordersAdminPage } from "./pages.js";

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
  resilience: flag("BUG_RESILIENCE", isV2) // wizard loses state on refresh; double-submit double-orders
};
const PERF_DELAY_MS = parseInt(process.env.PERF_DELAY_MS || "2000", 10);

const mailer = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "localhost",
  port: parseInt(process.env.MAIL_PORT || "1025", 10),
  secure: false
});

const orders = [];
const signups = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

app.use((req, res, next) => {
  res.locals.version = VERSION;
  res.locals.bugs = BUGS;
  next();
});

app.get("/", (req, res) => res.send(layout(VERSION, "Home", homePage(VERSION))));

app.get("/products", async (req, res) => {
  if (BUGS.perf) await sleep(PERF_DELAY_MS);
  res.send(layout(VERSION, "Products", productsPage(products, BUGS.visual)));
});

app.get("/products/:id", (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).send(layout(VERSION, "Not found", "<h1>Not found</h1>"));
  res.send(layout(VERSION, product.name, productDetailPage(product, BUGS.network)));
});

app.get("/api/products/:id/reviews", async (req, res) => {
  await sleep(150);
  res.json({ productId: Number(req.params.id), reviews: [{ author: "smith42", rating: 5, text: "Solid." }, { author: "forgemaster", rating: 4, text: "Does the job." }] });
});

app.get("/signup", (req, res) => res.send(layout(VERSION, "Sign up", signupPage())));

app.post("/api/signup", async (req, res) => {
  const { email, name } = req.body || {};
  if (!email || !email.includes("@")) return res.status(400).json({ error: "valid email required" });
  signups.push({ email, name, at: new Date().toISOString() });
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
  res.json({ ok: true, message: "Account created! Check your email to confirm." });
});

app.get("/checkout", (req, res) => res.send(layout(VERSION, "Checkout", checkoutPage(products, BUGS.resilience))));

app.post("/api/orders", async (req, res) => {
  const { items, shipping, idempotencyKey } = req.body || {};
  if (!items?.length || !shipping?.address) return res.status(400).json({ error: "items and shipping address required" });
  if (!BUGS.resilience && idempotencyKey) {
    const existing = orders.find((o) => o.idempotencyKey === idempotencyKey);
    if (existing) return res.json({ ok: true, orderId: existing.id, duplicate: true });
  }
  await sleep(400);
  const id = `ORD-${1000 + orders.length}`;
  const total = items.reduce((sum, it) => {
    const p = products.find((x) => x.id === it.productId);
    return sum + (p ? p.price * (it.qty || 1) : 0);
  }, 0);
  orders.push({ id, items, shipping, total, idempotencyKey, at: new Date().toISOString() });
  res.json({ ok: true, orderId: id, total });
});

app.get("/api/orders", (req, res) => res.json({ orders }));
app.get("/admin/orders", (req, res) => res.send(layout(VERSION, "Orders", ordersAdminPage(orders))));
app.get("/healthz", (req, res) => res.json({ ok: true, version: VERSION }));

const port = parseInt(process.env.PORT || "3000", 10);
app.listen(port, () => console.log(`forgeboard ${VERSION} listening on :${port} bugs=${JSON.stringify(BUGS)}`));
