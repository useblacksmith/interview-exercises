# Webhook state reconstruction

Blacksmith runs GitHub Actions jobs on just-in-time microVMs. GitHub reports each
job's lifecycle with `workflow_job` webhooks, and our control plane folds those
deliveries into a single state row per job. That row drives the dashboard and, for
finished jobs, billing.

You are given a capture of deliveries exactly as our webhook endpoint received them
(`deliveries.jsonl`). Your task is to reconstruct per-job state from that capture,
offline.

## Before you write code

- Requirements will evolve during the interview. Your interviewer will reveal more
  of the problem as you go, so structure your code such that a rule change stays
  localized.
- Use any language you like.
- Model the domain the way you think is right; how you shape the types and data is
  a big part of what we are looking at.
- All timestamps come from the input. Never read the wall clock. `received_at` is
  delivery metadata (when our endpoint received the webhook), not a job timestamp.

## Input format

One JSON object per line:

```json
{
  "delivery_id": "d-0042",
  "received_at": "2026-08-20T14:02:31Z",
  "action": "queued",
  "job": {
    "id": 1007,
    "name": "smoke",
    "labels": ["blacksmith-4vcpu-ubuntu-2404"],
    "started_at": "2026-08-20T14:02:28Z",
    "completed_at": null,
    "conclusion": null,
    "steps": []
  }
}
```

- `delivery_id` identifies a webhook delivery. `received_at` is arrival time at our
  endpoint. `action` is one of `queued`, `in_progress`, `completed`.
- Every `job` field except `id` is optional. Treat a key that is missing or `null`
  as absent. An empty `labels` array counts as present (it is a real value GitHub
  sends).
- `conclusion` on finished jobs is a string such as `success`, `failure`,
  `cancelled`, or `timed_out`.
- `steps`, when present, is an array of step objects:
  `{number, name, status, conclusion, started_at, completed_at}`. Some payloads
  carry it. Stage 1 does not use it.
- This is a capture from a real-shaped system: lines are not guaranteed to be well
  formed. Your program must not crash on a bad line; skip it and account for it
  (see output).

## Stage 1: fold in order

Process deliveries in file order, maintaining one state per job id:
`{id, status, labels, started_at, completed_at, conclusion}`.

- `status` is the `action` of the delivery you just applied.
- For each of `labels`, `started_at`, `completed_at`, and `conclusion`: when the
  payload carries the field (present per the rule above), it overwrites the stored
  value; when absent, keep what you had. Remember `labels: []` counts as present.
- A job is finished when its status is `completed` and both `started_at` and
  `completed_at` are set. Its duration is `completed_at - started_at` in whole
  seconds.

### Output

Print to stdout, one line per job, sorted by job id ascending, fields separated by
single spaces. Print `-` for anything unset (`labels` prints `-` when unset or
empty, otherwise comma-joined in payload order). `duration_s` prints only for
finished jobs. End with a final line carrying the malformed-line count:

```
<id> status=<status> labels=<a,b|-> started_at=<ts|-> completed_at=<ts|-> conclusion=<c|-> duration_s=<seconds|->
...
skipped_malformed=<n>
```

`expected-stage1.txt` is the exact expected stdout for `deliveries.jsonl`. Use it
to self-check.
