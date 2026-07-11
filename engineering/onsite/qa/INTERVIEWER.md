# Interviewer notes — DO NOT SHARE WITH CANDIDATE

## Planted bugs in v2 (all default-on when `APP_VERSION=v2`)

| # | Bug | Where | How a good agent catches it | Knob |
|---|-----|-------|------------------------------|------|
| 1 | Perf regression: ~2s server delay | `/products` page load | Before/after timing v1 vs v2, phase-by-phase screenshots | `BUG_PERF`, `PERF_DELAY_MS` |
| 2 | Visual regression: product card grid collapses (block layout, overflowing cards, mispositioned prices) | `/products` | Baseline screenshot diff v1 vs v2 | `BUG_VISUAL` |
| 3 | Silent flow failure: signup shows success toast but confirmation email is never sent | `/signup` | State proof: check Mailpit API (`GET :8025/api/v1/messages`) after signup — toast alone is a lie. **The separator bug.** | `BUG_EMAIL` |
| 4 | Network health: duplicate reviews API call + uncaught console error (`window.analytics` undefined) on a page that renders fine | `/products/:id` | Capture console + network during navigation; spot 2× identical `GET /api/products/:id/reviews` and the TypeError | `BUG_NETWORK` |
| 5 | Resilience: checkout wizard loses all state on refresh (v1 persists to sessionStorage); double-clicking "Place order" creates two orders (v1 disables button + server dedupes via idempotency key) | `/checkout` | Refresh mid-wizard and observe reset; double-submit then check `/admin/orders` or `GET /api/orders` for duplicates | `BUG_RESILIENCE` |

Each knob accepts `"0"`/`"1"` env overrides on either version, so you can tune difficulty
(e.g. give a struggling candidate a v1 with one bug enabled to test their detector deterministically).

## Difficulty calibration

- Bugs 1–2 should be catchable by lunch with a straightforward loop + timing/screenshots.
- Bug 4 requires wiring console/network capture into observations — good mid-day depth.
- Bug 3 requires the agent to seek out-of-band proof (Mailpit API) instead of trusting the UI —
  strong candidates find this; it's the highest-signal catch.
- Bug 5 requires the agent to actively perturb the app (refresh, double-click) — usually only
  reached by candidates who read the brief's "resilience" hint and design a check type for it.

## Verifying the sandbox before an interview

```
docker compose up --build
curl -s localhost:3000/healthz   # {"ok":true,"version":"v1"}
curl -s localhost:3001/healthz   # {"ok":true,"version":"v2"}
```

Then spot-check: `:3001/products` is slow + visually broken; signup on `:3001` yields no
Mailpit message (while `:3000` does); product detail on `:3001` logs a console error.
