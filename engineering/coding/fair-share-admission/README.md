# Fair-share job admission

Blacksmith runs CI jobs for many customer orgs on a shared fleet. Every few hundred
milliseconds the scheduler runs an admission round: it looks at the queue of pending jobs
and decides, against a fixed vCPU budget, which jobs get admitted this round and in what
order. You are going to build a miniature of that admission round as a small CLI.

A few things before you start:

- **Requirements will evolve during the interview.** That is the point of the exercise.
  Structure your code so that a policy change stays a local change.
- **Use any language you like.**
- **Model the domain the way you think is right.** We care more about your types and
  decomposition than about cleverness.
- **All timestamps come from the input.** Never read the wall clock.

## Input format

The input is a JSONL file (one JSON object per line).

The **first line is a header** carrying per-org metadata. Parse it now; later
requirements will use it:

```json
{"weights": {"acme": 1, "umbrella": 2}, "running": {"acme": 6, "umbrella": 0}}
```

- `weights`: relative scheduling weight per org (positive integer).
- `running`: vCPUs each org currently has running on the fleet (non-negative integer).

**Every other line is a job record:**

```json
{"id": "acme-01", "org": "acme", "vcpus": 4, "qos": "regular", "queued_at": "2026-08-26T09:00:00Z"}
```

- `id`: unique string.
- `org`: the org that queued the job.
- `vcpus`: positive integer, the job's width.
- `qos`: exactly one of `"high"`, `"regular"`, `"low"`.
- `queued_at`: RFC 3339 timestamp, minted by the control plane when the job was queued.

The input may contain malformed records. A malformed record must never crash your program
and must never be admitted. Decide deliberately how you handle it (skipping with a note on
stderr is fine); we will ask about your choice.

## Your task

Write a CLI that takes the input path and an integer vCPU budget, runs one admission
round, and prints the ids of admitted jobs to stdout, one per line, in admission order.

Admission rules for this round:

1. **Strict QoS tiers.** Admit `high` jobs before any `regular` job, and `regular` before
   any `low` job, regardless of age. A lower tier is considered only once the tiers above
   it are exhausted.
2. **Oldest first within a tier.** Order jobs by `queued_at`, oldest first. Ties break by
   `id` (lexicographic).
3. **Charge the budget.** Walk jobs in that order. Admitting a job subtracts its `vcpus`
   from the remaining budget. If a job does not fit the remaining budget, skip it and keep
   scanning (it stays queued for a future round).
4. **Stop** when the budget is exhausted or there are no jobs left.

## Self-check

Run your program against `jobs.jsonl` in this directory with a budget of `30`. Your
output should match `expected-stage1.txt` exactly.
