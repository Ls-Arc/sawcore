# Tasks: ci-foundation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~120-180 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR: CI scripts + workflows + README |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

Operational prerequisite: reconcile local `main` with `origin/main` before treating the new checks as authoritative; keep that as rollout hygiene, not implementation scope.

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Add CI script aliases and required workflow wiring | PR 1 | Base branch only; include local command parity checks |
| 2 | Add manual Docker smoke workflow and docs | PR 1 | Same PR; keep smoke non-blocking and clearly labeled |

## Phase 1: Foundation

- [x] 1.1 Add `ci:verify` to `package.json` as the Bun-first sequence: `typecheck`, `build`, `test`, `local:config`.
- [x] 1.2 Add `ci:smoke` to `package.json` as a thin alias to `bun run local:smoke`.

## Phase 2: CI Workflows

- [x] 2.1 Create `.github/workflows/ci.yml` with `push` + `pull_request` triggers on `main`, using `bun install` then `bun run ci:verify`.
- [x] 2.2 Create `.github/workflows/docker-smoke.yml` as a manual `workflow_dispatch` workflow that runs `bun run ci:smoke`.
- [x] 2.3 Keep Docker smoke out of the required CI path; if included anywhere else, ensure it is explicitly non-blocking.

## Phase 3: Verification

- [x] 3.1 Verify `bun run ci:verify` resolves to the intended local gate order and fails fast when any command fails.
- [x] 3.2 Verify `bun run ci:smoke` still exercises `apps/web/test/docker-compose-smoke.test.ts` through the existing local alias.
- [x] 3.3 Check the workflow YAML references only repo scripts and does not duplicate command ordering.

## Phase 4: Documentation

- [x] 4.1 Update `README.md` to list `ci:verify` and `ci:smoke` alongside the existing Bun commands.
- [x] 4.2 Document that required CI covers install/typecheck/build/test/config, while Docker smoke stays manual until stability improves.
