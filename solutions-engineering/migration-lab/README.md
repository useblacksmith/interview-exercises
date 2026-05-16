# Solutions Engineering Migration Lab

Thank you for interviewing with Blacksmith.

This exercise is meant to give you a practical feel for the kind of work Solutions Engineers do with customers. You will help a fictional company migrate a GitHub Actions repository to Blacksmith, inspect CI behavior, and prepare recommendations.

You can spend as much time as you would like, but the expected preparation time is about 60 to 90 minutes. If setup takes longer than that, stop and write down where you got stuck.

## Scenario

Acme Payments is migrating from GitHub-hosted runners to Blacksmith. They care about faster CI, lower spend, and a smoother debugging workflow when jobs fail.

They have a mixed CI pipeline with:

- Standard Linux jobs.
- Larger GitHub-hosted runner labels for heavier jobs.
- An Arm Docker build path.
- Unit tests split across shards.
- Integration tests that depend on Postgres.

Your goal is to get the repository running on Blacksmith and come prepared to explain what you observed.

## Prerequisites

- A GitHub account.
- A GitHub organization where you can install GitHub Apps.
- An SSH key configured on your GitHub account.
- Access to [app.blacksmith.sh](https://app.blacksmith.sh/).
- Node.js 20 or newer if you want to run parts of the app locally.

Blacksmith supports GitHub organizations, not personal repositories. If you do not already have a GitHub organization for testing, create one before starting.

## Preparation

1. Read the prep guide in [docs/candidate-prep.md](docs/candidate-prep.md).
2. Fork this repository into a GitHub organization that you control.
3. Install Blacksmith for the forked repository.
4. Use the Blacksmith migration wizard to migrate the GitHub Actions workflow.
5. Enable SSH access for the organization in Blacksmith.
6. If GitHub prompts you to approve Actions for the fork, approve it from the repository's Actions tab.
7. Run the workflow at least once on Blacksmith.
8. Review the run in Blacksmith Run History and CI Analytics.
9. Write short notes about what changed, what worked, what failed, and what you would investigate next.

## Repository Layout

```text
solutions-engineering/migration-lab/
  app/
    src/
    scripts/
    fixtures/
  docker/
  docs/
```

The workflow for this lab is located at the repository root:

```text
.github/workflows/acme-ci.yml
```

The workflow starts with GitHub-hosted runner labels on purpose. Use the migration wizard rather than manually editing every `runs-on` field.

## Deliverable

Prepare a short summary covering:

- How you migrated the workflow to Blacksmith.
- Which Blacksmith runner types you selected and why.
- What you observed in Run History and CI Analytics.
- What you would tell Acme Payments as next steps.

You do not need to fully optimize the repository. We care more about how you investigate and explain tradeoffs than about perfect final YAML.

## Useful Commands

From this directory:

```bash
cd solutions-engineering/migration-lab/app
npm ci
npm run lint
npm run build
npm run test:unit -- --shard=1/8
```

The integration test expects Postgres to be running. The workflow starts Postgres through Docker Compose.

## Useful Links

- [Blacksmith Quickstart](https://docs.blacksmith.sh/introduction/quickstart)
- [Runner Instance Types](https://docs.blacksmith.sh/blacksmith-runners/overview)
- [CI Analytics](https://docs.blacksmith.sh/blacksmith-observability/dashboard)
- [Run History](https://docs.blacksmith.sh/blacksmith-observability/history)
- [Monitors](https://docs.blacksmith.sh/blacksmith-observability/monitors)
- [SSH Access](https://docs.blacksmith.sh/blacksmith-observability/ssh-access)
