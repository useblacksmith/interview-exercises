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

# Simulated clock (seconds since midnight UTC, starting at 14:32:30)
SIM_SECS=$((14*3600 + 32*60 + 30))

sim_ts() {
  local h=$((SIM_SECS / 3600))
  local m=$(( (SIM_SECS % 3600) / 60 ))
  local s=$((SIM_SECS % 60))
  printf "2026-04-01T%02d:%02d:%02dZ" $h $m $s
}

log() {
  SIM_SECS=$((SIM_SECS + ${2:-1}))
  echo -e "${GRAY}$(sim_ts)${NC}  $1"
}

# Red timestamp to highlight suspicious time jumps
log_slow() {
  SIM_SECS=$((SIM_SECS + ${2:-1}))
  echo -e "${RED}$(sim_ts)${NC}  $1"
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

# Check if label is a valid Blacksmith label (must include vcpu spec)
is_blacksmith_label() {
  local label="$1"
  [[ "$label" =~ ^blacksmith-[0-9]+vcpu-ubuntu-[0-9]+$ ]]
}

# Extract vCPU count from a Blacksmith label (e.g., blacksmith-4vcpu-ubuntu-2404 -> 4)
get_vcpu() {
  local label="$1"
  echo "$label" | grep -o '[0-9]*vcpu' | grep -o '[0-9]*'
}

# Extract Ubuntu version from a runner label
get_ubuntu_version() {
  local label="$1"
  if [[ "$label" == *"2204"* ]]; then
    echo "2204"
  elif [[ "$label" == *"2404"* ]]; then
    echo "2404"
  elif [[ "$label" == "ubuntu-latest" || "$label" == "ubuntu-22.04" ]]; then
    echo "2204"
  else
    echo "unknown"
  fi
}

# Check if region looks like EU
is_eu_region() {
  local region="$1"
  [[ "$region" == *"eu"* ]]
}

# Print summary and exit
print_summary() {
  separator
  echo -e "${BOLD}Pipeline Summary${NC}"
  echo ""
  echo -e "  ${BOLD}ci.yml:${NC}"
  echo -e "  lint           ${GREEN}✓ PASSED${NC}  1m 08s"

  if [[ -n "$DOCKER_STATUS" ]]; then
    if [[ "$DOCKER_STATUS" == "pass" ]]; then
      echo -e "  build-docker   ${GREEN}✓ PASSED${NC}  ${DOCKER_TIME}"
    else
      echo -e "  build-docker   ${RED}✗ FAILED${NC}  ${DOCKER_TIME}"
    fi
  else
    echo -e "  build-docker   ${GRAY}— SKIPPED${NC}"
  fi

  if [[ -n "$TEST_STATUS" ]]; then
    if [[ "$TEST_STATUS" == "pass" ]]; then
      echo -e "  test           ${GREEN}✓ PASSED${NC}  ${TEST_TIME}"
    else
      echo -e "  test           ${RED}✗ FAILED${NC}  ${TEST_TIME}"
    fi
  else
    echo -e "  test           ${GRAY}— SKIPPED${NC}"
  fi

  echo ""
  echo -e "  ${BOLD}deploy.yml:${NC}"
  if [[ -n "$DEPLOY_STATUS" ]]; then
    if [[ "$DEPLOY_STATUS" == "pass" ]]; then
      echo -e "  deploy-api     ${GREEN}✓ PASSED${NC}  ${DEPLOY_TIME}"
    else
      echo -e "  deploy-api     ${RED}✗ FAILED${NC}  ${DEPLOY_TIME}"
    fi
  else
    echo -e "  deploy-api     ${GRAY}— SKIPPED${NC}"
  fi
  echo ""
}

# Parse command line arguments
RUN_JOB=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --job)
      RUN_JOB="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

# ============================================================
# READ WORKFLOW CONFIG
# ============================================================

LINT_LABEL=$(get_runs_on "$CI_WORKFLOW" "lint")
TEST_LABEL=$(get_runs_on "$CI_WORKFLOW" "test")
DOCKER_LABEL=$(get_runs_on "$CI_WORKFLOW" "build-docker")
DEPLOY_LABEL=$(get_runs_on "$DEPLOY_WORKFLOW" "deploy-api")

CI_REGION=$(get_blacksmith_region "$CI_WORKFLOW")
BS_REGION=$(get_blacksmith_region "$DEPLOY_WORKFLOW")
AWS_REG=$(get_aws_region "$DEPLOY_WORKFLOW")

TEST_UBUNTU=$(get_ubuntu_version "$TEST_LABEL")

# ============================================================
# SINGLE JOB MODE (--job test)
# ============================================================

if [[ "$RUN_JOB" == "test" ]]; then
  echo ""
  echo -e "${BOLD}Job: test${NC}"

  if is_blacksmith_label "$TEST_LABEL"; then
    TEST_VCPU=$(get_vcpu "$TEST_LABEL")
    log "Requesting runner for label: ${TEST_LABEL}"
    log "Runner machine name: blacksmith-01kf8xmndcxw5chm29zg9wmx3r-${TEST_VCPU}vcpu" 0
  else
    log "Requesting runner for label: ${TEST_LABEL}"
    log "Runner machine name: github-actions-xlarge-runner" 0
  fi

  if [[ "$TEST_UBUNTU" == "2204" ]]; then
    log "Operating System: Ubuntu 22.04.4 LTS" 0
  else
    log "Operating System: Ubuntu 24.04.1 LTS" 0
  fi
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

  if [[ "$TEST_UBUNTU" == "2404" ]]; then
    log "Test Suites: 17 passed, 1 failed, 18 total"
    log "Tests:       62 passed, 2 failed, 64 total"
    echo ""
    echo -e "  ${RED}FAIL${NC} test/integration/config-parser.test.sh"
    echo ""
    echo -e "  ${RED}●${NC} Config parser > should extract version from production config"
    echo -e "    Command: grep -oP '(?<=APP_VERSION=)\\S+' .env.production"
    echo -e "    Expected: \"2.4.1\""
    echo -e "    Received: \"\" (empty - no match)"
    echo ""
    echo -e "  ${RED}●${NC} Config parser > should extract all config keys"
    echo -e "    Command: grep -cP '\\w+=.+' .env.production"
    echo -e "    Expected: 14"
    echo -e "    Received: 0"
    echo ""
    echo -e "  ${GRAY}grep --version: grep (GNU grep) 3.11${NC}"
    step_end
    echo ""
    echo -e "  ${RED}✗${NC} Job FAILED (2 tests failed)"
    exit 1
  else
    log "Test Suites: 18 passed, 18 total"
    log "Tests:       64 passed, 64 total"
    echo ""
    echo -e "  ${GRAY}grep --version: grep (GNU grep) 3.7${NC}"
    step_end
    echo ""
    echo -e "  ${GREEN}✓${NC} Job completed successfully (duration: 2m 31s)"
  fi
  exit 0
fi

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
# ALL CI LABELS VALID - RUN PIPELINE
# Job order: lint → build-docker → deploy → test
# Pipeline stops at first failure.
# ============================================================

# ---- LINT JOB ----
LINT_VCPU=$(get_vcpu "$LINT_LABEL")
echo -e "${BOLD}Job: lint${NC}"
log "Requesting runner for label: ${LINT_LABEL}"
sleep 0.3
log "Runner machine name: blacksmith-01kf8xmndcxw5chm29zg9wmx3r-${LINT_VCPU}vcpu"
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

# ---- DOCKER BUILD JOB ----
DOCKER_VCPU=$(get_vcpu "$DOCKER_LABEL")
echo -e "${BOLD}Job: build-docker${NC}"
log "Requesting runner for label: ${DOCKER_LABEL}"
sleep 0.3
log "Runner machine name: blacksmith-01kf8xrqdcxw5chm29zg9wmx6s-${DOCKER_VCPU}vcpu"
log "Operating System: Ubuntu 24.04.1 LTS"
echo ""
sleep 0.3

if [[ "$DOCKER_VCPU" -le 2 ]]; then
  # ---- OOM: runner too small ----
  step_start "Run actions/checkout@v4"
  sleep 0.2
  log "Syncing repository: novapay/platform"
  step_end

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
  log "#3 importing cache manifest from blacksmith local NVMe"
  sleep 0.3
  log "#3 cache hit - restored 847MB of layer data"
  log "#4 [base 1/4] FROM docker.io/library/node:20-alpine (CACHED)"
  log "#5 [base 2/4] COPY package.json package-lock.json ./ (CACHED)"
  log "#6 [base 3/4] RUN npm ci (CACHED)"
  log "#7 [base 4/4] COPY . ."
  log "#8 [base 5/5] RUN npm run build"
  sleep 0.5
  log "#8 Compiling TypeScript..."
  sleep 0.3
  log "#8 Bundling application..."
  sleep 0.3
  echo -e "  ${RED}##[error]${NC} ERROR: process \"/bin/sh -c npm run build\" did not complete successfully: exit code 137"
  echo -e "  ${RED}##[error]${NC} out of memory: Container killed due to memory limit exceeded"
  echo -e "  ${GRAY}  Peak memory usage: 7.8GB / 8GB limit${NC}"
  step_end

  echo ""
  echo -e "  ${RED}✗${NC} Job FAILED (exit code 137 - out of memory)"
  DOCKER_TIME="4m 22s"
  DOCKER_STATUS="fail"

  print_summary
  exit 1

else
  # ---- Correct: Blacksmith caching, sufficient resources ----
  step_start "Run actions/checkout@v4"
  sleep 0.2
  log "Syncing repository: novapay/platform"
  step_end

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
  log "#8 Build completed in 12.4s"
  log "#9-14 [production layers] (mostly CACHED)"
  log "#15 exporting to image"

  # Push speed depends on runner region
  if is_eu_region "$CI_REGION"; then
    log "#15 pushing layers to ghcr.io..." 1
    sleep 0.3
    log_slow "#15 pushing layer 1/4: 128MB uploaded" 18
    log_slow "#15 pushing layer 2/4: 256MB uploaded" 34
    sleep 0.2
    log_slow "#15 pushing layer 3/4: 89MB uploaded" 13
    log "#15 pushing layer 4/4: 42MB uploaded" 6
    log "#16 committing layer cache to Blacksmith sticky disk" 2
    log "#16 done" 1
    step_end

    echo ""
    echo -e "  ${GREEN}✓${NC} Job completed successfully (duration: 3m 41s)"
    DOCKER_TIME="3m 41s"
    DOCKER_STATUS="pass"
  else
    log "#15 pushing layers to ghcr.io..." 1
    sleep 0.2
    log "#15 pushed 4 layers (515MB total)" 4
    log "#16 committing layer cache to Blacksmith sticky disk" 2
    log "#16 done" 1
    step_end

    echo ""
    echo -e "  ${GREEN}✓${NC} Job completed successfully (duration: 1m 48s)"
    DOCKER_TIME="1m 48s"
    DOCKER_STATUS="pass"
  fi
fi

separator

# ---- DEPLOY JOB ----
echo -e "${BOLD}Job: deploy-api${NC} ${GRAY}(from deploy.yml)${NC}"
log "Requesting runner for label: ${DEPLOY_LABEL}"
sleep 0.3
log "Runner machine name: blacksmith-01kf8xwndcxw5chm29zg9wmx7v-4vcpu" 0
log "Operating System: Ubuntu 24.04.1 LTS" 0
log "Runner region: ${BS_REGION}" 0
echo ""
sleep 0.3

# Check for region mismatch
if [[ "$BS_REGION" == *"eu"* && "$AWS_REG" == *"us"* ]]; then
  REGION_MISMATCH=true
else
  REGION_MISMATCH=false
fi

# -- Checkout --
step_start "Run actions/checkout@v4"
sleep 0.2
log "Syncing repository: novapay/platform" 2
step_end

# -- Docker login --
step_start "Run docker/login-action@v3"
sleep 0.2
log "Login to ghcr.io successful" 1
step_end

# -- Docker pull --
step_start "Run docker pull ghcr.io/novapay/platform:abc123def"
sleep 0.3
log "abc123def: Pulling from novapay/platform" 1
log "Pull complete" 3
step_end

# -- AWS credentials --
step_start "Run aws-actions/configure-aws-credentials@v4"
sleep 0.2
log "AWS credentials configured (region: ${AWS_REG})" 1
step_end

# -- ECS update --
step_start "Run aws ecs update-service"
sleep 0.5
if [[ "$REGION_MISMATCH" == true ]]; then
  log "Connecting to ecs.${AWS_REG}.amazonaws.com..." 1
  sleep 0.3
  log "Updating service novapay-api in cluster novapay-prod..." 1
  log_slow "Service updated successfully" 8
else
  log "Connecting to ecs.${AWS_REG}.amazonaws.com..." 1
  log "Updating service novapay-api in cluster novapay-prod..." 1
  log "Service updated successfully" 1
fi
step_end

# -- ECS wait --
step_start "Run aws ecs wait services-stable"
sleep 0.5
if [[ "$REGION_MISMATCH" == true ]]; then
  log "Polling ECS service status..." 1
  sleep 0.5
  log_slow "Service stabilized after 18 polls" 282
else
  log "Polling ECS service status..." 1
  log "Service is stable (3 polls)" 42
fi
step_end

# -- Smoke tests --
step_start "Run smoke tests"
sleep 0.3
if [[ "$REGION_MISMATCH" == true ]]; then
  log "Running smoke tests against https://api.novapay.io..." 1
  log "  ✓ GET  /api/health (418ms)" 2
  log "  ✓ GET  /api/version (612ms)" 2
  log "  ✓ GET  /api/config (384ms)" 2
  sleep 0.5
  log_slow "  ✗ POST /api/payments/process — ETIMEDOUT" 30
  echo ""
  echo -e "  ${RED}##[error]${NC} Error: connect ETIMEDOUT https://api.novapay.io/api/payments/process"
  echo -e "  ${RED}##[error]${NC} 3/12 smoke tests passed, 1 timed out (30000ms), 8 not run"
  step_end
  echo ""
  echo -e "  ${RED}✗${NC} Job FAILED (exit code 1)"
  DEPLOY_STATUS="fail"
  DEPLOY_TIME="8m 34s"

  print_summary
  exit 1
else
  log "Running smoke tests against https://api.novapay.io..." 1
  sleep 0.3
  log "All 12 smoke tests passed" 4
  step_end
  echo ""
  echo -e "  ${GREEN}✓${NC} Job completed successfully (duration: 2m 49s)"
  DEPLOY_STATUS="pass"
  DEPLOY_TIME="2m 49s"
fi

separator

# ---- TEST JOB ----
TEST_VCPU=$(get_vcpu "$TEST_LABEL")
echo -e "${BOLD}Job: test${NC}"
log "Requesting runner for label: ${TEST_LABEL}"
sleep 0.3
log "Runner machine name: blacksmith-01kf8xmndcxw5chm29zg9wmx3r-${TEST_VCPU}vcpu"
if [[ "$TEST_UBUNTU" == "2204" ]]; then
  log "Operating System: Ubuntu 22.04.4 LTS"
else
  log "Operating System: Ubuntu 24.04.1 LTS"
fi
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

if [[ "$TEST_UBUNTU" == "2404" ]]; then
  log "Test Suites: 17 passed, 1 failed, 18 total"
  log "Tests:       62 passed, 2 failed, 64 total"
  echo ""
  echo -e "  ${RED}FAIL${NC} test/integration/config-parser.test.sh"
  echo ""
  echo -e "  ${RED}●${NC} Config parser > should extract version from production config"
  echo -e "    Command: grep -oP '(?<=APP_VERSION=)\\S+' .env.production"
  echo -e "    Expected: \"2.4.1\""
  echo -e "    Received: \"\" (empty - no match)"
  echo ""
  echo -e "  ${RED}●${NC} Config parser > should extract all config keys"
  echo -e "    Command: grep -cP '\\w+=.+' .env.production"
  echo -e "    Expected: 14"
  echo -e "    Received: 0"
  echo ""
  echo -e "  ${GRAY}grep --version: grep (GNU grep) 3.11${NC}"
  step_end

  echo ""
  echo -e "  ${RED}✗${NC} Job FAILED (2 tests failed)"
  TEST_STATUS="fail"
  TEST_TIME="2m 31s"

  print_summary
  exit 1
else
  log "Test Suites: 18 passed, 18 total"
  log "Tests:       64 passed, 64 total"
  echo ""
  echo -e "  ${GRAY}grep --version: grep (GNU grep) 3.7${NC}"
  step_end

  echo ""
  echo -e "  ${GREEN}✓${NC} Job completed successfully (duration: 2m 31s)"
  TEST_STATUS="pass"
  TEST_TIME="2m 31s"
fi

# ---- ALL PASSED ----
print_summary
