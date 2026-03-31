#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GRAY='\033[0;90m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CI_WORKFLOW="$SCRIPT_DIR/.github/workflows/ci.yml"
DEPLOY_WORKFLOW="$SCRIPT_DIR/.github/workflows/deploy.yml"

timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

log() {
  echo -e "${GRAY}$(timestamp)${NC}  $1"
}

step_start() {
  echo ""
  echo -e "${BLUE}##[group]${NC} ${BOLD}$1${NC}"
}

step_end() {
  echo -e "${BLUE}##[endgroup]${NC}"
}

separator() {
  echo ""
  echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

# Parse runs-on label for a specific job from a workflow file
get_runs_on() {
  local file="$1"
  local job="$2"
  sed -n "/^  ${job}:/,/^  [a-z]/p" "$file" | grep "runs-on:" | head -1 | sed 's/.*runs-on: *//' | tr -d "'" | tr -d '"'
}

# Get the BLACKSMITH_RUNNER_REGION env var from a workflow file
get_blacksmith_region() {
  local file="$1"
  grep "BLACKSMITH_RUNNER_REGION:" "$file" | head -1 | sed 's/.*BLACKSMITH_RUNNER_REGION: *//' | tr -d "'" | tr -d '"'
}

# Get the AWS_REGION env var from a workflow file
get_aws_region() {
  local file="$1"
  grep "AWS_REGION:" "$file" | head -1 | sed 's/.*AWS_REGION: *//' | tr -d "'" | tr -d '"'
}

# Check which docker setup action is used
get_docker_setup_action() {
  local file="$1"
  grep -o "uses: [a-zA-Z/\-]*setup-\(docker-builder\|buildx-action\)@v[0-9]*" "$file" | head -1 | sed 's/uses: //'
}

# Check if label is a valid Blacksmith label
is_blacksmith_label() {
  local label="$1"
  [[ "$label" == blacksmith-* ]]
}

# Extract vCPU count from a Blacksmith label (e.g., blacksmith-4vcpu-ubuntu-2404 -> 4)
get_vcpu() {
  local label="$1"
  echo "$label" | grep -o '[0-9]*vcpu' | grep -o '[0-9]*'
}

# ============================================================
# READ WORKFLOW CONFIG
# ============================================================

LINT_LABEL=$(get_runs_on "$CI_WORKFLOW" "lint")
TEST_LABEL=$(get_runs_on "$CI_WORKFLOW" "test")
DOCKER_LABEL=$(get_runs_on "$CI_WORKFLOW" "build-docker")
DEPLOY_LABEL=$(get_runs_on "$DEPLOY_WORKFLOW" "deploy-api")

DOCKER_SETUP=$(get_docker_setup_action "$CI_WORKFLOW")

# Pre-check: are all runner labels valid?
CI_LABELS_VALID=true
for label in "$LINT_LABEL" "$TEST_LABEL" "$DOCKER_LABEL"; do
  if ! is_blacksmith_label "$label"; then
    CI_LABELS_VALID=false
    BAD_LABEL="$label"
    BAD_JOB=""
    [[ "$label" == "$LINT_LABEL" ]] && BAD_JOB="lint"
    [[ "$label" == "$TEST_LABEL" ]] && BAD_JOB="test"
    [[ "$label" == "$DOCKER_LABEL" ]] && BAD_JOB="build-docker"
    break
  fi
done

DEPLOY_LABEL_VALID=true
if ! is_blacksmith_label "$DEPLOY_LABEL"; then
  DEPLOY_LABEL_VALID=false
fi

# ============================================================
# CI PIPELINE
# ============================================================

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║              NovaPay CI Pipeline - Simulated Run                ║${NC}"
echo -e "${BOLD}║              Trigger: push to main                              ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════════════╝${NC}"

separator

# ---- CHECK CI LABELS ----
if [[ "$CI_LABELS_VALID" == false ]]; then
  echo -e "${BOLD}Job: ${BAD_JOB}${NC}"
  log "Requesting runner for label: ${BAD_LABEL}"
  sleep 0.5
  log "Waiting for a hosted runner to pick up this job..."
  sleep 1
  log "Still waiting for a runner..."
  sleep 1
  log "Still waiting for a runner... (elapsed: 2m 14s)"
  sleep 1
  log "Still waiting for a runner... (elapsed: 5m 02s)"
  sleep 0.5
  log "Still waiting for a runner... (elapsed: 10m 31s)"
  sleep 0.5
  log "Still waiting for a runner... (elapsed: 15m 08s)"
  sleep 0.5
  echo ""
  echo -e "  ${RED}##[error]${NC} The job running on runner label '${BAD_LABEL}' has been waiting for a runner for more than 15 minutes."
  echo -e "  ${RED}##[error]${NC} No hosted runner matching '${BAD_LABEL}' was found in this organization."
  echo -e "  ${GRAY}  Ensure that the runner label in your workflow 'runs-on' field matches a configured runner.${NC}"
  echo -e "  ${GRAY}  If you recently migrated runners, verify all workflow files have been updated.${NC}"
  echo ""
  echo -e "  ${RED}✗${NC} Job FAILED (timed out waiting for runner)"

  separator

  echo -e "${BOLD}Pipeline aborted.${NC}"
  echo ""
  exit 1
fi

# ============================================================
# ALL CI LABELS VALID - RUN FULL PIPELINE
# ============================================================

# ---- LINT JOB ----
echo -e "${BOLD}Job: lint${NC}"
log "Requesting runner for label: ${LINT_LABEL}"
sleep 0.3
log "Runner machine name: blacksmith-01kf8xmndcxw5chm29zg9wmx3r-4vcpu"
log "Operating System: Ubuntu 24.04.1 LTS"
echo ""
sleep 0.3

step_start "Run actions/checkout@v4"
sleep 0.2
log "Syncing repository: novapay/platform"
step_end

step_start "Run actions/setup-node@v4"
sleep 0.2
log "Found node version 20.11.1 in cache"
step_end

step_start "Run npm ci"
sleep 0.2
log "Cache restored from key: npm-linux-x64-novapay-abc123"
sleep 0.3
log "added 1,247 packages in 4.3s"
step_end

step_start "Run npx eslint src/ --max-warnings=0"
sleep 0.3
log "All files passed linting."
step_end

step_start "Run npx prettier --check"
sleep 0.2
log "All matched files are formatted."
step_end

step_start "Run npx tsc --noEmit"
sleep 0.3
log "Type checking..."
sleep 0.3
log "Done in 12.4s"
step_end

echo ""
echo -e "  ${GREEN}✓${NC} Job completed successfully (duration: 1m 08s)"

separator

# ---- TEST JOB ----
echo -e "${BOLD}Job: test${NC}"
log "Requesting runner for label: ${TEST_LABEL}"
sleep 0.3
log "Runner machine name: blacksmith-01kf8xmndcxw5chm29zg9wmx3r-4vcpu"
log "Operating System: Ubuntu 24.04.1 LTS"
echo ""
sleep 0.3

step_start "Run actions/checkout@v4"
sleep 0.2
log "Syncing repository: novapay/platform"
step_end

step_start "Run actions/setup-node@v4"
sleep 0.2
log "Found node version 20.11.1 in cache"
step_end

step_start "Run npm ci"
sleep 0.2
log "Cache restored from key: npm-linux-x64-novapay-abc123"
sleep 0.3
log "added 1,247 packages in 4.3s"
step_end

step_start "Run npx prisma migrate deploy"
sleep 0.3
log "12 migrations applied successfully"
step_end

step_start "Run npm run test:unit -- --coverage"
sleep 0.5
log "Test Suites: 42 passed, 42 total"
log "Tests:       187 passed, 187 total"
log "Coverage:    78.3% statements"
step_end

step_start "Run npm run test:integration"
sleep 0.5
log "Test Suites: 18 passed, 18 total"
log "Tests:       64 passed, 64 total"
step_end

echo ""
echo -e "  ${GREEN}✓${NC} Job completed successfully (duration: 2m 31s)"

separator

# ---- DOCKER BUILD JOB ----
DOCKER_VCPU=$(get_vcpu "$DOCKER_LABEL")
echo -e "${BOLD}Job: build-docker${NC}"
log "Requesting runner for label: ${DOCKER_LABEL}"
sleep 0.3
log "Runner machine name: blacksmith-01kf8xrqdcxw5chm29zg9wmx6s-${DOCKER_VCPU}vcpu"
log "Operating System: Ubuntu 24.04.1 LTS"
echo ""
sleep 0.3

# Check if runner has enough memory for Docker build
if [[ "$DOCKER_VCPU" -le 2 ]]; then
  step_start "Run actions/checkout@v4"
  sleep 0.2
  log "Syncing repository: novapay/platform"
  step_end

  step_start "Run docker/setup-buildx-action@v3"
  sleep 0.3
  log "Docker Buildx installed"
  step_end

  step_start "Run docker/login-action@v3"
  sleep 0.2
  log "Login to ghcr.io successful"
  step_end

  step_start "Run docker/build-push-action@v6"
  log "#1 [internal] load build definition from Dockerfile"
  log "#2 [internal] load .dockerignore"
  log "#3 [base 1/4] FROM docker.io/library/node:20-alpine"
  sleep 0.3
  log "#4 [base 2/4] COPY package.json package-lock.json ./"
  log "#5 [base 3/4] RUN npm ci"
  sleep 0.5
  log "#5 added 1,247 packages in 154.2s"
  log "#6 [base 4/4] COPY . ."
  log "#7 [base 5/5] RUN npm run build"
  sleep 0.5
  log "#7 Compiling TypeScript..."
  sleep 0.3
  log "#7 Bundling application..."
  sleep 0.3
  echo -e "  ${RED}##[error]${NC} ERROR: process \"/bin/sh -c npm run build\" did not complete successfully: exit code 137"
  echo -e "  ${RED}##[error]${NC} out of memory: Container killed due to memory limit exceeded"
  echo -e "  ${GRAY}  Peak memory usage: 7.8GB / 8GB limit${NC}"
  echo -e "  ${GRAY}  The runner's memory (8GB on 2vCPU) is not sufficient for this build.${NC}"
  step_end

  echo ""
  echo -e "  ${RED}✗${NC} Job FAILED (exit code 137 - out of memory)"
  DOCKER_TIME="4m 22s"
  DOCKER_STATUS="fail"

  separator

  # Still run deploy since it's independent
  # (fall through to deploy section below)

elif [[ "$DOCKER_SETUP" == *"useblacksmith"* ]]; then
  # Correct - using Blacksmith docker actions
  step_start "Run useblacksmith/setup-docker-builder@v1"
  sleep 0.3
  log "Docker Buildx installed"
  log "Builder: blacksmith-builder"
  log "Connected to Blacksmith Docker layer cache"
  step_end

  step_start "Run docker/login-action@v3"
  sleep 0.2
  log "Login to ghcr.io successful"
  step_end

  step_start "Run useblacksmith/build-push-action@v2"
  log "#1 [internal] load build definition from Dockerfile"
  log "#2 [internal] load .dockerignore"
  sleep 0.2
  log "#3 importing cache manifest from blacksmith local NVMe"
  sleep 0.3
  log "#3 cache hit - restored 847MB of layer data"
  log "#4 [base 1/4] FROM docker.io/library/node:20-alpine (CACHED)"
  log "#5 [base 2/4] COPY package.json package-lock.json ./ (CACHED)"
  log "#6 [base 3/4] RUN npm ci (CACHED)"
  log "#7 [base 4/4] COPY . ."
  log "#8 [base 5/5] RUN npm run build"
  sleep 0.3
  log "#8 Build completed in 86.1s"
  log "#9-14 [production layers] (mostly CACHED)"
  log "#15 exporting to image"
  log "#15 pushing layers"
  sleep 0.2
  log "#16 committing layer cache to Blacksmith sticky disk"
  log "#16 done"
  step_end

  echo ""
  echo -e "  ${GREEN}✓${NC} Job completed successfully (duration: 2m 12s)"
  DOCKER_TIME="2m 12s"
  DOCKER_STATUS="pass"
else
  # Wrong - using GitHub's docker actions
  step_start "Run docker/setup-buildx-action@v3"
  sleep 0.3
  log "Docker Buildx installed"
  log "Builder: default"
  step_end

  step_start "Run docker/login-action@v3"
  sleep 0.2
  log "Login to ghcr.io successful"
  step_end

  step_start "Run docker/build-push-action@v6"
  log "Building with cache-from: type=gha"
  sleep 0.3
  log "#1 [internal] load build definition from Dockerfile"
  log "#2 [internal] load .dockerignore"
  sleep 0.2
  log "#3 importing cache manifest from gha:novapay/platform"
  sleep 0.5
  log "#3 ${YELLOW}WARN: cache miss - no matching manifest found in GitHub Actions cache${NC}"
  sleep 0.3
  log "#4 [base 1/4] FROM docker.io/library/node:20-alpine"
  sleep 0.3
  log "#4 sha256:abc123... 42.1MB / 42.1MB downloaded"
  log "#5 [base 2/4] COPY package.json package-lock.json ./"
  log "#6 [base 3/4] RUN npm ci"
  sleep 0.5
  log "#6 added 1,247 packages in 154.2s"
  log "#7 [base 4/4] COPY . ."
  log "#8 [base 5/5] RUN npm run build"
  sleep 0.5
  log "#8 Build completed in 86.1s"
  log "#9 [production 1/5] FROM docker.io/library/node:20-alpine (CACHED)"
  log "#10-14 [production layers]..."
  sleep 0.3
  log "#15 exporting to image"
  log "#15 pushing layers"
  sleep 0.3
  log "#16 exporting cache to GitHub Actions cache"
  sleep 0.5
  log "#16 preparing build cache for export"
  log "#16 ${YELLOW}WARN: upload to GitHub Actions cache slow (24.2s for 312MB, ~12.9 MB/s)${NC}"
  log "#16 done"
  step_end

  echo ""
  echo -e "  ${GREEN}✓${NC} Job completed successfully (duration: 6m 58s)"
  DOCKER_TIME="6m 58s"
  DOCKER_STATUS="pass"
fi

separator

# ---- DEPLOY JOB ----
BS_REGION=$(get_blacksmith_region "$DEPLOY_WORKFLOW")
AWS_REG=$(get_aws_region "$DEPLOY_WORKFLOW")

echo -e "${BOLD}Job: deploy-api${NC} ${GRAY}(from deploy.yml)${NC}"
log "Requesting runner for label: ${DEPLOY_LABEL}"
sleep 0.3
log "Runner machine name: blacksmith-01kf8xwndcxw5chm29zg9wmx7v-4vcpu"
log "Operating System: Ubuntu 24.04.1 LTS"
log "Runner region: ${BS_REGION}"
echo ""
sleep 0.3

step_start "Run actions/checkout@v4"
sleep 0.2
log "Syncing repository: novapay/platform"
step_end

step_start "Run docker/login-action@v3"
sleep 0.2
log "Login to ghcr.io successful"
step_end

# Check for region mismatch
if [[ "$BS_REGION" == *"eu"* && "$AWS_REG" == *"us"* ]] || [[ "$BS_REGION" == *"eu"* && "$AWS_REG" == *"us"* ]]; then
  REGION_MISMATCH=true
else
  REGION_MISMATCH=false
fi

step_start "Run docker pull ghcr.io/novapay/platform:abc123def"
sleep 0.3
if [[ "$REGION_MISMATCH" == true ]]; then
  log "abc123def: Pulling from novapay/platform"
  sleep 0.5
  log "${YELLOW}WARN: slow transfer - pulling image across regions (runner: ${BS_REGION}, registry: us-east-1)${NC}"
  log "Downloading: 847MB at 12.4 MB/s (68.3s)"
  sleep 0.3
  log "Pull complete (68.3s)"
else
  log "abc123def: Pulling from novapay/platform"
  log "Pull complete (4.2s)"
fi
step_end

step_start "Run aws-actions/configure-aws-credentials@v4"
sleep 0.2
log "AWS credentials configured (region: ${AWS_REG})"
step_end

step_start "Run aws ecs update-service"
sleep 0.5
if [[ "$REGION_MISMATCH" == true ]]; then
  log "Updating service in ${AWS_REG}..."
  sleep 0.5
  log "${YELLOW}WARN: high latency to AWS API endpoint (runner: ${BS_REGION}, AWS: ${AWS_REG}, RTT: 142ms)${NC}"
  log "Service updated successfully"
else
  log "Service updated successfully"
fi
step_end

step_start "Run aws ecs wait services-stable"
sleep 1
if [[ "$REGION_MISMATCH" == true ]]; then
  log "Polling ECS service status across regions..."
  sleep 0.5
  log "Service is stable (polling took 4m 12s due to cross-region latency)"
else
  log "Service is stable"
fi
step_end

step_start "Run smoke tests"
sleep 0.3
if [[ "$REGION_MISMATCH" == true ]]; then
  log "Running smoke tests against https://api.novapay.io..."
  sleep 0.5
  echo -e "  ${RED}##[error]${NC} Error: connect ETIMEDOUT 52.14.88.91:443"
  echo -e "  ${RED}##[error]${NC} Smoke test failed: POST /api/payments/health timed out after 30000ms"
  echo -e "  ${GRAY}  BLACKSMITH_RUNNER_REGION: ${BS_REGION}${NC}"
  echo -e "  ${GRAY}  AWS_REGION: ${AWS_REG}${NC}"
  step_end
  echo ""
  echo -e "  ${RED}✗${NC} Job FAILED (exit code 1)"
  DEPLOY_STATUS="fail"
  DEPLOY_TIME="8m 34s"
else
  log "Running smoke tests against https://api.novapay.io..."
  log "All 12 smoke tests passed (3.1s)"
  step_end
  echo ""
  echo -e "  ${GREEN}✓${NC} Job completed successfully (duration: 2m 49s)"
  DEPLOY_STATUS="pass"
  DEPLOY_TIME="2m 49s"
fi

separator

# ---- SUMMARY ----
echo -e "${BOLD}Pipeline Summary${NC}"
echo ""
echo -e "  ${BOLD}ci.yml:${NC}"
echo -e "  lint           ${GREEN}✓ PASSED${NC}  1m 08s"
echo -e "  test           ${GREEN}✓ PASSED${NC}  2m 31s"
if [[ "$DOCKER_STATUS" == "pass" ]]; then
  echo -e "  build-docker   ${GREEN}✓ PASSED${NC}  ${DOCKER_TIME}"
else
  echo -e "  build-docker   ${RED}✗ FAILED${NC}  ${DOCKER_TIME}"
fi

echo ""
echo -e "  ${BOLD}deploy.yml:${NC}"
if [[ "$DEPLOY_STATUS" == "pass" ]]; then
  echo -e "  deploy-api     ${GREEN}✓ PASSED${NC}  ${DEPLOY_TIME}"
else
  echo -e "  deploy-api     ${RED}✗ FAILED${NC}  ${DEPLOY_TIME}"
fi

echo ""
