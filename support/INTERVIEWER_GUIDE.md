# Interviewer Guide: Support Engineer Challenge

## Overview

| | |
|---|---|
| **Duration** | 50 minutes |
| **Format** | Live debugging + verbal customer communication |
| **Your role** | Play "Colin" — frustrated NovaPay DevOps engineer |
| **Candidate access** | This repo, a terminal, browser for general reference |

## Pre-Interview Setup

1. Clone the repo to a fresh directory for the candidate
2. Ensure `simulate.sh` is executable: `chmod +x simulate.sh`
3. Do NOT brief the candidate on what bugs exist or how many
4. Tell the candidate:

> "You'll be working through a customer support scenario. I'll be playing the customer at certain points. Treat this like a real support interaction — I want to see how you investigate, communicate, and handle what you find."

---

## Phase 1: Initial Response (5 minutes)

Give the candidate the README. Let them read Colin's ticket (2 min), then:

> "OK you've read Colin's ticket. Before you start investigating, how would you respond to Colin right now?"

### What to Listen For

| Criterion | Y/N |
|-----------|-----|
| Acknowledges Colin's frustration | |
| Sets expectations (timeline, next steps) | |
| Asks any clarifying questions | |

### Good Response Example

"Hi Colin, I completely understand the frustration — having your CI break right after a migration is exactly what we want to help you resolve quickly. I'm going to look at your workflow files and pipeline output right now. I should have initial findings shortly and will walk you through what I find and what we need to change."

### Red Flags

- Jumps straight to "let me look at the code" with no acknowledgment
- Makes promises they can't keep ("I'll have this fixed in 5 minutes")
- Asks no questions at all

---

## Phase 2: Investigation (30 minutes)

Let the candidate work. They should run `bash simulate.sh`, examine files, and start fixing issues. The simulation stops at the first failure, so each fix reveals the next issue.

### Round 1: Docker OOM (Bug 1)

**What happens:** Simulation runs lint (passes), then Docker build fails with exit code 137 — OOM kill on `blacksmith-2vcpu-ubuntu-2404` (8GB RAM). Test and deploy are skipped.

**Expected fix:** Change build-docker job `runs-on` to `blacksmith-4vcpu-ubuntu-2404` (16GB) or larger. Candidate should reference `docs/runner-types.md` to pick the right size.

**Verification:** Candidate re-runs. Docker build succeeds and is fast (cached layers), but push is slow (7.1 MB/s avg, warning about expected >100 MB/s). Pipeline continues to deploy, which fails.

**After the fix, deliver this as Colin:**

> "Build is way faster now, that's great! But the push step still takes over a minute. And our deploy to production is still completely broken — smoke tests time out every time."

**Difficulty:** Easy — error message is explicit, runner-types.md has the spec table.

---

### Round 2: Cold Cache Explanation (Communication Checkpoint)

**Trigger:** After Docker fix, deliver this as Colin:

> "Actually wait — we re-ran the pipeline and the first Docker build after your changes was still around 6 minutes. Are you sure this caching thing is actually working? This doesn't seem any different from what we had on GitHub."

**This is NOT a bug.** The candidate needs to explain cold cache behavior.

### What to Listen For

| Criterion | Y/N |
|-----------|-----|
| Explains that first build populates the cache from scratch | |
| Sets expectation that second+ builds will be fast | |
| Doesn't panic or second-guess the fix | |

### Good Response Example

"That's expected behavior. The first build after switching needs to populate the cache from scratch — there's no existing cached data to pull from. On the next build, Blacksmith will reuse the cached layers from its local NVMe storage and you should see a significant speedup. I'd recommend running the pipeline twice and comparing."

### Bad Response Example

- "That's weird, let me check again" (doesn't understand cold cache)
- "It should be fast, I don't know why it isn't" (can't explain the behavior)

---

### Round 3: Region Mismatch (Bug 2)

**Trigger:** After cold cache explanation, deliver this as Colin:

> "OK that makes sense about the caching. But our deploy to production is still failing — the smoke tests time out every single time and our release has been blocked for two days. We need this fixed."

**What happens:** The simulation tells the story through timestamps. No explicit warnings — the candidate has to read the clock:
- Docker push: timestamps jump 18-34 seconds between layers (red-highlighted), vs 1s apart for build steps
- Deploy: checkout/login/pull finish in seconds (close timestamps), then ECS update takes 8s (red), ECS wait jumps **4 minutes 42 seconds** (red), smoke tests pass a few GETs slowly (418ms, 612ms) before POST /api/payments/process times out after 30s (red)
- The runner region (`eu-central`) and AWS region (`us-west-2`) are both visible in the output but not called out

**Expected fix:** Change `BLACKSMITH_RUNNER_REGION: eu-central` to `us-west` in BOTH `ci.yml` and `deploy.yml`. The customer said they're US-based in their original ticket, and `AWS_REGION` is `us-west-2`.

**Key diagnostic reasoning the candidate should demonstrate:**
- Notice the red timestamp jumps on AWS operations vs fast GitHub operations
- Read the runner region (`eu-central`) and AWS region (`us-west-2`) from the output
- Connect the dots: runner is in EU, AWS infra is in US → cross-region latency
- Connect slow Docker push (ci.yml) to the same root cause — both involve pushing data cross-region

**Verification:** Candidate re-runs. Docker push completes in ~4s (close timestamps), deploy passes, all 12 smoke tests pass. Pipeline continues to test, which fails.

**Difficulty:** Medium+ — requires reading timestamps carefully and connecting clues across two workflow files.

---

### Round 4: Environment Parity / Escalation (Bug 3)

**Trigger:** After region fix, deliver this as Colin:

> "Deploy is working now, thank you! But we're also seeing 2 test failures that always passed on GitHub. Something about a config parser? Our tests haven't changed at all."

**What happens:** The simulation shows test failures:
```
FAIL test/integration/config-parser.test.sh
  grep -oP '(?<=APP_VERSION=)\S+' .env.production
  Expected: "2.4.1", Got: "" (empty)

  grep --version: grep (GNU grep) 3.11
  Ubuntu 24.04 ships grep 3.11 which changed PCRE (-P) pattern handling.
  These tests pass with grep 3.7 on Ubuntu 22.04 (GitHub Actions runners).
```

**Expected response (three parts):**
1. **Identify:** This is an environment parity issue — grep behaves differently on Ubuntu 24.04 vs 22.04
2. **Workaround:** Suggest changing the test job to `blacksmith-4vcpu-ubuntu-2204` as a temporary fix
3. **Escalate:** Flag this to Blacksmith's engineering team for investigation

**Verification:** If candidate changes test job to `ubuntu-2204`, simulation shows all tests passing.

**Difficulty:** Hard — requires reading the error carefully, understanding it's NOT a customer config issue, and knowing when to escalate vs. fix.

### What to Listen For

| Criterion | Y/N |
|-----------|-----|
| Identified as an environment/version difference (not customer's fault) | |
| Suggested ubuntu-2204 workaround | |
| Said they would escalate to engineering | |
| Did NOT try to "fix" the grep pattern or blame the customer | |

---

### Timing Guide

If the candidate is stuck for more than 8 minutes on any bug, offer a nudge:

| Bug | Nudge |
|-----|-------|
| Docker OOM | "The error says exit code 137 — what does that typically mean?" |
| Region mismatch | "Look at the deploy output — which operations are slow and which are fast?" |
| Env parity | "The error mentions specific versions. What's different about the environment?" |

If the candidate finishes all bugs early, ask:

> "Is there anything else you'd proactively recommend to Colin to optimize their setup?"

Good answers: different runner sizes for different jobs (lint doesn't need 4vcpu), monitoring build times, etc.

---

## Phase 3: Summary & Written Follow-Up (10–15 minutes)

### Verbal Summary

> "OK, let's wrap up the investigation. Can you walk me through everything you found and what you changed?"

Listen for: structured summary, mentions all issues found, explains the reasoning not just the fix, mentions the escalation item.

### Written Follow-Up

> "Last thing — can you draft a quick follow-up message to me summarizing what was fixed? Like you'd send as a support ticket reply."

Give them 5 minutes. Evaluate:

| Criterion | Y/N |
|-----------|-----|
| Structured and scannable (not a wall of text) | |
| Lists what was wrong and what was changed | |
| Mentions expected improvements (build time, deploy reliability) | |
| Mentions the test/grep issue and next steps (escalation) | |
| Professional tone (helpful, not condescending) | |

---

## Evaluation Rubric

### Technical Debugging

| # | Bug | Found | Fixed | Verified (re-ran sim) |
|---|-----|-------|-------|-----------------------|
| 1 | Docker OOM (2vCPU / 8GB) | Y/N | Y/N | Y/N |
| 2 | Region mismatch (`eu-central` vs `us-west-2`) | Y/N | Y/N | Y/N |
| 3 | Env parity (grep 3.11 vs 3.7) | Y/N | Workaround / N | Y/N |

### Escalation Judgment

| Criterion | Y/N |
|-----------|-----|
| Identified grep issue as env parity (not customer config) | |
| Suggested ubuntu-2204 workaround | |
| Said they would escalate to eng team | |
| Communicated appropriately to Colin | |

### Customer Communication

| Criterion | Y/N |
|-----------|-----|
| Initial response: acknowledged frustration | |
| Initial response: set expectations | |
| Cold cache: explained clearly and confidently | |
| Verbal summary: structured and complete | |
| Written follow-up: scannable and actionable | |

### Process

| Criterion | Y/N |
|-----------|-----|
| Referenced provided docs (runner-types.md, overview.md, etc.) | |
| Re-ran simulation after making fixes | |
| Worked systematically (not random trial-and-error) | |
| Connected slow Docker push to region mismatch (same root cause) | |

---

## Scoring Guide

### Strong Hire
- All 3 bugs found and fixed/workaround applied
- Escalation handled correctly (identified, workaround, escalate)
- Communication strong throughout (empathy, clear explanations, structured summary)
- Connected slow push + deploy timeout as same root cause
- Written follow-up is solid

### Hire
- 2-3 bugs found and fixed
- Escalation mostly handled (identified issue, may not have suggested workaround)
- Communication adequate (some empathy, reasonable explanations)
- Written follow-up covers the key points

### Borderline
- 1-2 bugs found and fixed
- May have missed the escalation or tried to "fix" the grep issue
- Communication lacks structure or empathy
- Struggled with region mismatch diagnostic reasoning

### No Hire
- Fewer than 1 bug found
- Poor communication (no empathy, jargon-heavy, or dismissive)
- Could not navigate the documentation
- Tried random changes without understanding root causes
- Ignored or missed the escalation scenario entirely
