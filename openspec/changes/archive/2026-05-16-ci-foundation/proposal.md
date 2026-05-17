# Proposal: ci-foundation

## Intent
Establish Sawcore’s first CI contract now that a GitHub remote exists. The goal is to mirror the Bun-first local verification flow in GitHub Actions without promoting Docker smoke to a hard gate before it stabilizes.

## Scope
### In Scope
- Add a minimal GitHub Actions workflow for `bun install`, `bun run typecheck`, `bun run build`, `bun test`, and `bun run local:config`.
- Keep Docker smoke in a separate manual/non-blocking job until host flakiness is reduced.
- Align docs and scripts so CI follows the existing Bun-first local commands.

### Out of Scope
- Branch protection rules, required-check enforcement, or release automation.
- Docker smoke as a required gate.
- Product/domain behavior changes.

## Capabilities
### New Capabilities
- None.

### Modified Capabilities
- None.

## Approach
Use the current Bun scripts as the source of truth and introduce a lean `.github/workflows/ci.yml` with a fast required job plus an optional smoke job (`workflow_dispatch` or non-blocking). Reconcile local `main` with `origin/main` before treating GitHub as authoritative.

## Affected Areas
| Area | Impact | Description |
|---|---|---|
| `.github/workflows/ci.yml` | New | Minimal CI pipeline and optional Docker smoke job |
| `package.json` | Modified | Preserve CI parity with existing Bun scripts |
| `README.md` | Modified | Document the CI contract and local parity |
| `openspec/changes/ci-foundation/proposal.md` | New | Proposal artifact |

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| Remote history mismatch from GitHub’s initial commit | Med | Rebase/merge carefully before enabling required checks |
| Docker smoke flakiness | High | Keep it optional/manual until stable |
| CI drift from local workflow | Med | Use existing Bun scripts as the single source of truth |

## Rollback Plan
Remove the workflow, keep local scripts unchanged, and fall back to the current Bun verification commands. If history reconciliation becomes messy, pause CI enforcement until `main` and `origin/main` are aligned.

## Dependencies
- GitHub remote `origin`
- Existing Bun lock/install and local verification scripts

## Success Criteria
- [ ] GitHub Actions runs install/typecheck/build/test/local:config successfully.
- [ ] Docker smoke exists but is not blocking.
- [ ] Local and CI commands match.
- [ ] Remote-history reconciliation is explicitly resolved before required checks are enabled.
