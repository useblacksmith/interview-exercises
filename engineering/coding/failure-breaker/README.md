# The failure breaker

Blacksmith runs CI jobs on a fleet of bare-metal hosts. Each host adopts jobs off a
shared queue. When a host gets sick (wedged NBD subsystem, exhausted IP pool, dying
kernel), it fails every job it adopts, fast. A healthy host almost never fails several
adoptions back to back, so a small streak of consecutive infrastructure failures
cleanly separates the two. Your task: a circuit breaker that stops a sick host from
pulling jobs off the queue and failing them all.

This is a single-threaded, event-driven simulation. There is no real concurrency and
no sleeping. The breaker is driven entirely by timestamped events, and "now" is always
the timestamp of the event being processed, never the wall clock.

A few things to know before you start:

- Requirements will evolve during the interview. Structure your code so a rule change
  stays local.
- Use any language you like.
- Model the domain the way you think is right. How you shape the types and where you
  put the policy matters more than raw speed.

## Input format

Input is JSONL: one JSON event per line, timestamps in non-decreasing order. Process
events in file order.

```json
{"t": 1000, "type": "adopt_request", "job_id": "j-01"}
```

| Field | Meaning |
|---|---|
| `t` | event time in milliseconds (integer) |
| `type` | `adopt_request`, `job_failed`, or `job_healthy` |
| `job_id` | the job the event is about; for `adopt_request`, the job the host would adopt |

- `adopt_request`: the host asks whether to adopt this job. If you answer allow, the
  job is adopted at time `t`.
- `job_failed`: the job failed with a host-local infrastructure error.
- `job_healthy`: the job proved the host works.

Real event streams are not pristine. If a line is not a well-formed event, your
program must not crash; report the line and move on (see the output format).

## Stage 1: threshold breaker

Constants: failure threshold `5`, cooldown `120000` ms.

- `job_failed` increments a consecutive-failure streak.
- When the streak reaches the threshold (streak >= 5 after the increment) and the
  breaker is not currently open, it opens: `open_until = t + 120000`.
- While open (event time `t < open_until`), every `adopt_request` is denied. Once the
  cooldown has expired (`t >= open_until`), requests are allowed again.
- A failure that arrives while the breaker is already open extends the streak but does
  not restart the cooldown.
- `job_healthy` resets the streak to 0 and closes the breaker if it was open.

## Output format

Print exactly one line per input line, in order:

| Input | Output line |
|---|---|
| `adopt_request` | `t=<t> adopt <job_id> allow` or `t=<t> adopt <job_id> deny` |
| `job_failed` | `t=<t> fail <job_id> streak=<n>`, with ` open until=<open_until>` appended when this event opened the breaker |
| `job_healthy` | `t=<t> healthy <job_id> reset` |
| malformed line | `line <n> malformed` (1-based line number) |

## Self-check

`events.jsonl` is a sample input. Running your stage 1 implementation on it should
produce exactly `expected-stage1.txt`:

```
your-program events.jsonl | diff - expected-stage1.txt
```
