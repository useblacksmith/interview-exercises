# Build an Autonomous QA Agent

## The problem

Forgeboard is a small storefront app. A new release (**v2**) is about to ship. Somewhere between
**v1** (the current production build, at `http://localhost:3000`) and **v2** (the release
candidate, at `http://localhost:3001`) some things broke. We know of **5 planted issues** in v2.
We're not telling you where they are.

Your job is to build the tool that finds them: an **autonomous QA agent** that takes a web app
plus a natural-language test intent — e.g.

- "verify the signup flow works end-to-end"
- "confirm the new release didn't regress page load times"
- "check that checkout survives a refresh"

— drives a real browser to check it, and produces an **evidence report a skeptical engineer
would trust**: the steps taken, screenshots, pass/fail, and the reasoning behind the verdict.

You may use any agentic tools you like (Cursor, Devin, Claude, etc.). The laptop has an
Anthropic API key configured (see `agent/.env.example`).

## What we're looking for

1. **The agent loop** — plan → act (browser tools) → observe → verify. How you design the tool
   API, what the model sees each turn, and how "done/pass/fail" gets decided.
2. **Live runs** — a run should be something a human can watch and steer: pause it, take over
   the browser (then hand back), add instructions mid-run, cancel cleanly.
3. **Evidence over vibes** — a PASS backed by proof (a timing number, a diff, an email that
   actually arrived) beats a PASS because the model said so.
4. **The report** — this is the product. Someone who didn't watch the run should be able to
   trust the verdict.

## Milestones

- **By lunch:** one check runs end-to-end against the sandbox and emits a screenshot-annotated
  report. Catching at least one planted bug counts as a win.
- **Afternoon (pick your direction, don't do everything):**
  - live run view with streaming steps and pause/take-over
  - a before/after verification mode (perf timing or visual diff between v1 and v2)
  - concurrent runs / viewport matrix
  - checkpoint/resume, retries, flake handling
  - report polish and failure triage

You demo what you built at the end of the day. Partial is fine — we care about the design and
your reasoning at least as much as feature count.

## The sandbox

```
docker compose up --build
```

| Service | URL | Notes |
|---|---|---|
| Forgeboard v1 (baseline) | http://localhost:3000 | "production" |
| Forgeboard v2 (release candidate) | http://localhost:3001 | contains the 5 planted issues |
| Mailpit (email sandbox) | http://localhost:8025 | web UI; JSON API at `/api/v1/messages` |

Both app versions send email through Mailpit. `GET /healthz` on either app reports its version.

The agent skeleton in `agent/` has Playwright installed and a working example
(`npm run example`) that visits the app and saves a screenshot. There is intentionally no agent
loop — that's the exercise.
