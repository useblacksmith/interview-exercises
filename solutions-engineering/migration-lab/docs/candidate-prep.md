# Candidate Prep

Please complete these steps before discussing the exercise.

## Read

- Blacksmith Quickstart: https://docs.blacksmith.sh/introduction/quickstart
- Runner instance types: https://docs.blacksmith.sh/blacksmith-runners/overview
- CI Analytics: https://docs.blacksmith.sh/blacksmith-observability/dashboard
- Run History: https://docs.blacksmith.sh/blacksmith-observability/history
- Monitors: https://docs.blacksmith.sh/blacksmith-observability/monitors
- SSH Access: https://docs.blacksmith.sh/blacksmith-observability/ssh-access

## Set Up

1. Create or use a GitHub organization.
2. Fork https://github.com/useblacksmith/interview-exercises into that organization.
3. Install Blacksmith for the forked repository.
4. Use the Blacksmith migration wizard to migrate `.github/workflows/acme-ci.yml`.
5. Enable SSH access in Blacksmith settings.
6. If GitHub prompts you to approve Actions for the fork, approve it from the repository's Actions tab.
7. Run the workflow at least once on Blacksmith.
8. Review the run in Blacksmith Run History and CI Analytics.

## Write Notes

Write brief notes on:

- What changed during migration.
- Which runner labels you selected.
- Any failures you saw.
- What you would investigate next for the customer.

It is fine if you do not resolve every issue.
