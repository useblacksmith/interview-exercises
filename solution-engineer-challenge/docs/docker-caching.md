# Docker Layer Caching on Blacksmith

Source: https://docs.blacksmith.sh/blacksmith-caching/docker-builds

## Setup

To get fast Docker builds with persistent layer caching, use the Blacksmith-specific Docker actions:

### Step 1: Replace the buildx setup action

**Before (GitHub default):**
```yaml
- uses: docker/setup-buildx-action@v3
```

**After (Blacksmith):**
```yaml
- uses: useblacksmith/setup-docker-builder@v1
```

### Step 2: Replace the build-push action

**Before (GitHub default):**
```yaml
- uses: docker/build-push-action@v6
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

**After (Blacksmith):**
```yaml
- uses: useblacksmith/build-push-action@v2
```

### Important: Remove cache directives

Any `cache-from` and `cache-to` directives should be **removed** when using Blacksmith's actions. Blacksmith handles caching automatically via persistent NVMe-backed sticky disks.

## How It Works

1. `setup-docker-builder` configures a buildx builder with access to cached layers from prior runs
2. `build-push-action` executes the Docker build, reusing cached layers
3. At job completion, changes are committed to the layer cache for future runs

## Performance

Organizations report **2x to 40x improvements** in Docker build times after switching to Blacksmith's caching.

## Common Mistake

Using `docker/build-push-action` with `cache-from: type=gha` on Blacksmith will route Docker layer cache through GitHub's backend instead of Blacksmith's local NVMe storage, meaning you won't benefit from Blacksmith's Docker layer caching.
