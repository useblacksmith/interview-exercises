# Solutions Engineering Migration Lab

Thank you for interviewing with Blacksmith.

This exercise is meant to give you a practical feel for the kind of work Solutions Engineers do with customers. You will help a fictional company migrate a GitHub Actions repository to Blacksmith, inspect CI behavior, make workflow changes, and explain recommendations.

## Scenario

Acme Payments is evaluating Blacksmith for its GitHub Actions workloads. The team cares about faster CI, lower spend, and a smoother debugging workflow when jobs fail.

The repository contains a representative CI pipeline with:

- Runner labels that should be migrated to Blacksmith.
- Jobs with different compute requirements.
- Docker builds for multiple architectures.
- Tests split across shards.
- Integration tests that depend on Postgres.

Your goal during the interview is to help Acme get started on Blacksmith, inspect the resulting CI behavior, and recommend changes.

## Preparation

Please complete these steps before the interview. Do not run the migration wizard before the interview.

1. Create or use a GitHub organization where you can install GitHub Apps. This can be a personal organization, a project organization, or any other organization you control.
2. Fork this repository into that organization.
3. Go to [app.blacksmith.sh](https://app.blacksmith.sh/) and install the Blacksmith GitHub App for the forked repository.
4. Confirm that you can open the Blacksmith dashboard and see your organization in the top-left organization dropdown.
5. Enable SSH access for the organization in Blacksmith settings.
6. If GitHub prompts you to approve Actions for the fork, approve it from the repository's Actions tab.
7. Check out the repository locally and make sure Claude Code or Codex is working in that checkout.

If your Blacksmith account needs additional verification, reach out by email before the interview.

Success criteria for preparation: you can log into Blacksmith, select the organization that contains your fork from the top-left dropdown, and see that organization in the dashboard.

Again, do not migrate the workflow before the interview. We will do that together as part of the exercise.

## CI Workflow

The GitHub Actions workflow for this lab is:

```text
.github/workflows/acme-ci.yml
```

The workflow is intentionally the main surface area for the exercise. It contains jobs named:

- `Background report profile`
- `Fraud model benchmark`
- `Unit tests shard */8`
- `Integration tests`
- `Docker build (...)`

You should be comfortable opening this workflow, reading the job definitions, and making changes during the interview.

## Resources

A Notion prep doc will be shared with you as part of the interview invite. Use that document for the customer brief and recommended reading before the interview.

You do not need to solve anything before the interview.
