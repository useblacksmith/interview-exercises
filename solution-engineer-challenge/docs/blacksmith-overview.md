# Blacksmith Quick Start & Overview

Source: https://docs.blacksmith.sh/introduction/quickstart

## What is Blacksmith?

Blacksmith is a drop-in replacement for GitHub Actions runners that runs your workflows faster and costs up to 75% less.

When customers run CI/CD pipelines on GitHub Actions, instead of using GitHub's default runners (`ubuntu-latest`), they use Blacksmith's runners which are:

- **2x faster runners** - Bare metal gaming CPUs optimized for single-core CI tasks
- **4x faster cache** - Same-datacenter artifact storage for dependency caching
- **40x faster Docker builds** - NVMe persistence for Docker layer caching across CI runs
- **Up to 75% less cost** - Compared to standard GitHub Actions runners

## How It Works

1. Customer installs the Blacksmith GitHub App on their organization
2. They update their workflow files to use Blacksmith runner labels instead of GitHub's
3. When a workflow runs, Blacksmith picks up the job and executes it on our infrastructure

## Key Concept: Runner Labels

Customers switch from GitHub to Blacksmith by changing the `runs-on` field in their workflow YAML files for eg to allow their jobs to run on Blacksmith:

**GitHub (default):**
```yaml
runs-on: ubuntu-latest
```

**Blacksmith:**
```yaml
runs-on: blacksmith-4vcpu-ubuntu-2404
```

**Important:** Workflow files may contain multiple jobs. Ensure you update ALL `runs-on` fields to use Blacksmith runners.

Our current runner regions are `us-west`, `eu-central`, and `eu-west`. For best performance, your runner region should match where your infrastructure is hosted.