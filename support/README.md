# Support Engineer Challenge

## Scenario

You're a Support Engineer at Blacksmith. A potential high value customer (NovaPay) based in the US has just migrated their CI/CD pipelines from GitHub-hosted runners to Blacksmith. They're frustrated because things aren't working as expected and they've opened a support ticket:

> Hi,
>
> We migrated to Blacksmith last week following the migration guide and honestly it's been a nightmare. Our CI pipeline is completely broken — jobs aren't running, our deploy keeps failing and timing out, and we can't figure out why. We are based in the US if that helps with anything.
>
> On top of that, our Docker build step is still taking almost 7 minutes which is basically the same as what we were getting on GitHub. We're a large org and we need these build times cut significantly — that was one of the main reasons we switched to Blacksmith in the first place.
>
> A few members of team have tried to set Blacksmith up and ran into similar issues.
>
> Any help would be really appreciated.
>
> Thanks,
> Colin (NovaPay DevOps)

## Prerequisites

- A terminal (macOS/Linux/WSL)
- No dependencies required — the simulation is a standalone bash script

## Your Task

Run the pipeline simulation to see what the customer is experiencing:

```bash
bash simulate.sh
```

This simulates a full CI pipeline run and shows the output from each job. Investigate the pipeline output, dig into the source files, and use the Blacksmith documentation to understand what's going wrong and fix it. Re-run the simulation after each fix to verify your changes.

You can also run a single job in isolation:

```bash
bash simulate.sh --job test
```

### Files to Investigate

- `.github/workflows/ci.yml` — CI pipeline (lint, test, docker build)
- `.github/workflows/deploy.yml` — Deployment pipeline
- `Dockerfile` — Docker build configuration

### Reference Documentation

- [docs.blacksmith.sh](https://docs.blacksmith.sh) — Blacksmith documentation (runner types, regions, Docker caching, etc.)
