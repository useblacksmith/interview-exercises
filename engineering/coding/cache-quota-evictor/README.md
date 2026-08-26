# Cache quota evictor

Blacksmith gives every repo on the platform a shared GitHub Actions cache. Each repo gets
a fixed quota, but usage is measured over a sliding window: a cache entry counts against
the quota only while it is being used. Entries that fall out of the window still exist on
disk, they just stop counting. You are building the offline tool the cache team uses to
answer "which repos are over quota, and what should we evict".

## Ground rules

- Requirements will evolve during the interview. You will get them in stages, verbally.
  Structure your code so a requirement change stays localized.
- Use any language you like.
- Model the domain the way you think is right. How you represent entries, repos, and
  results is part of the exercise.
- All timestamps come from the input and the `--now` argument. Never read the wall clock.

## Constants

| Constant | Value |
|---|---|
| Quota per repo | 25 GiB (26,843,545,600 bytes) |
| Usage window | 7 days, sliding, relative to `--now` |
| Eviction target | 80% of quota (you will need this later) |

## Input format

`entries.jsonl`: one JSON object per line, each describing a live cache entry.

```json
{"key":"api-build-cache-01","repo":"acme/api","size_bytes":4294967296,"created_at":"2026-08-09T12:00:00Z","last_used_at":"2026-08-14T00:00:00Z"}
```

- `key`: unique identifier of the entry
- `repo`: `owner/name` the entry belongs to
- `size_bytes`: integer size of the entry on disk
- `created_at`, `last_used_at`: ISO 8601 UTC timestamps

The file is exported from a real fleet, so a line may be malformed. Decide how to handle
that deliberately: it must not crash the run, and it must be visible in your output.

## Stage 1: quota report

Your tool takes `--now <ISO 8601 timestamp>` and the path to the JSONL file.

A repo's **counted usage** is the sum of `size_bytes` over its entries whose
`last_used_at` is strictly inside the window: `last_used_at > now - 7 days`. An entry
whose `last_used_at` is exactly 7 days old is out of the window.

Print one line per repo (every repo that appears in valid input), sorted by repo name,
then a final line with the malformed line count:

```
<repo> counted_bytes=<n> over_quota=<yes|no>
malformed_lines=<n>
```

`over_quota=yes` means counted usage is strictly greater than the quota.

## Self-check

Running against `entries.jsonl` with `--now 2026-08-20T12:00:00Z` must reproduce
`expected-stage1.txt` byte for byte.
