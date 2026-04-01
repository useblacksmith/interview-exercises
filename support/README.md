# Support Engineer Challenge

## Scenario

You're a Support Engineer at Blacksmith. A potential high value customer (NovaPay) based in the US has just migrated their CI/CD pipelines from GitHub-hosted runners to Blacksmith. They're frustrated because things aren't working as expected and they've opened a support ticket:

> Hi,
>
> We migrated to Blacksmith last week following the migration guide and honestly it's been a nightmare. Our CI pipeline is completely broken!! A few members of team have tried to set Blacksmith up and ran into similar issues, Jobs aren't running, our deploy keeps failing and timing out, and we can't figure out why. We are based in the US if that helps with anything.
>
> On top of that, our Docker build step is still taking almost 7 minutes which is basically the same as what we were getting on GitHub. We're a large org and we need these build times cut significantly - that was one the main reasons we switched to Blacksmith in the first place.
>
> Any optimisations you can suggest for the Docker build would be really appreciated.
>
> Thanks,
> Colin (NovaPay DevOps)

## Prerequisites

- A terminal (macOS/Linux/WSL)
- No dependencies required - the simulation is a standalone bash script

## Your Task

### Step 1: Run the pipeline simulation

Start by seeing what the customer is experiencing:

```bash
bash simulate.sh
```

Or if you have npm installed:

```bash
npm run simulate
```

This simulates a full CI pipeline run and shows you the output from each job.

### Step 2: Investigate

Based on what you saw in the simulation, dig into the source files to understand why things are failing or underperforming and make changes in the following files:

- `.github/workflows/ci.yml` - CI pipeline (lint, test, docker build)
- `.github/workflows/deploy.yml` - Deployment pipeline

Use the Blacksmith documentation in `docs/` to cross-reference what you find alongside official documentation.

## Reference Documentation

- `docs/blacksmith-overview.md` - Quick start guide, runner labels, and regions
- `docs/runner-types.md` - Runner types, specs, and pricing
- `docs/docker-caching.md` - How to set up Docker layer caching
