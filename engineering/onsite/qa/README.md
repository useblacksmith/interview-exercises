# Forgeboard QA sandbox

Forgeboard is a small marketplace app used as the target for the autonomous QA agent
exercise: landing page, signup (with confirmation email) and login, a product catalog
with a per-account cart, checkout from the cart, and an order history page. The full
exercise brief is shared separately as a Notion doc.

A demo account is seeded so the app is usable without signing up:
`wayland@forgeboard.dev` / `anvil123`.

## The two releases

| Service | URL | Notes |
|---|---|---|
| Forgeboard **v1** (baseline) | http://localhost:3000 | current "production" build |
| Forgeboard **v2** (release candidate) | http://localhost:3001 | needs QA before it ships |
| Mailpit (email sandbox) | http://localhost:8025 | web UI; JSON API at `/api/v1/messages` |

v1 is the known-good reference. v2 is the release under test: somewhere between v1 and v2
some things broke, and the exercise is to build the QA agent that finds and proves them.

## Running it

```
docker compose up --build
```

Both app versions send email through Mailpit (SMTP on :1025). `GET /healthz` on either app
reports its version. State is in-memory; restarting a container resets users, carts, and orders.

## CAPTCHA mode (human-in-the-loop exercise)

The login page has an optional CAPTCHA for exercising human takeover: tick
"Protect this login with a CAPTCHA" on `/login`, or open `/login?captcha=1`
directly. The requirement then sticks (cookie) until a login passes it. The
challenge is a slide-to-verify widget: completing it takes a real pointer drag
(press, continuous movement, release), which an agent limited to click/fill
tools cannot perform no matter what it sees — but a human at the browser can.
The solved state is tracked server-side and checked at login.

## Agent skeleton

`agent/` has Playwright installed and a working example (`npm run example`) that visits the
app and saves a screenshot. There is intentionally no agent loop — that's the exercise.
