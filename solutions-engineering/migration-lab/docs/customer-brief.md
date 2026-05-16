# Customer Brief

Acme Payments is moving its GitHub Actions workloads to Blacksmith.

The team has three goals:

1. Reduce CI spend.
2. Improve end-to-end CI time.
3. Make failed job debugging easier.

The repository contains a representative CI pipeline with linting, builds, unit tests, integration tests, and Docker builds.

Acme has asked for help answering these questions:

- Are we using the right runner sizes?
- Are our test shards balanced?
- Are there jobs that should stay on x64 or move to Arm?
- How should we investigate intermittent CI failures?
- What changes would you recommend before rolling this out to more repositories?
