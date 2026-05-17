# Design: ci-foundation

## Technical Approach

Add a thin GitHub Actions CI layer that delegates almost all behavior to Bun scripts already living in `package.json`. The required pipeline stays intentionally small: install deps, typecheck, build, test, and validate Docker Compose config. Docker smoke remains separate and manual until it proves stable enough to be trusted as a gate.

The workflow should mirror the Bun-first local contract, not reimplement it. That keeps CI and developer machines aligned and avoids command drift.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| CI entrypoint | `bun` scripts remain the source of truth | Duplicate shell commands in workflow YAML | Package scripts are already the local contract; YAML should only orchestrate. |
| Required workflow | One `ci` workflow on `pull_request` and `push` to `main` | Multiple required workflows/jobs | A single fast gate is easier to understand and to protect. |
| Smoke handling | Separate manual workflow for Docker smoke | Non-blocking job in the required pipeline | Smoke is environment-dependent; keeping it manual prevents host flakiness from blocking merges. |
| Bun version | Match CI to the repo’s tested Bun version / Docker image | Use latest Bun on runners | Version skew is a common source of false failures; alignment reduces surprises. |

## Data Flow

GitHub event → workflow job → `bun install` → package script alias → existing local commands → status check

```text
pull_request/push
  ↓
GitHub Actions runner
  ↓
bun install
  ↓
package.json scripts
  ├── ci:verify → typecheck → build → test → local:config
  └── ci:smoke  → local:smoke (manual only)
```

## File Changes

| File | Action | Description |
|---|---|---|
| `.github/workflows/ci.yml` | Create | Minimal required CI for install/typecheck/build/test/config validation. |
| `.github/workflows/docker-smoke.yml` | Create | Manual workflow for Docker Compose smoke; non-blocking by default. |
| `package.json` | Modify | Add thin CI aliases so workflows do not duplicate command ordering. |
| `README.md` | Modify | Document CI/local parity and the smoke workflow split. |
| `openspec/changes/ci-foundation/design.md` | Create | Design artifact. |

## Interfaces / Contracts

```json
{
  "scripts": {
    "ci:verify": "bun run typecheck && bun run build && bun test && bun run local:config",
    "ci:smoke": "bun run local:smoke"
  }
}
```

Workflow inputs are intentionally minimal: no matrix, no service container, no custom install logic. If a future step needs extra flags, they should be added to the package script, not embedded in YAML.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | CI script wiring | `bun run ci:verify` remains a thin composition of existing commands. |
| Integration | Build/test/config parity | Required workflow runs on `push`/`pull_request` and fails fast on any Bun gate. |
| E2E | Docker Compose smoke | Manual workflow only, with cleanup and port isolation preserved. |

## Migration / Rollout

No product migration required. Roll out in two steps: land the required CI workflow first, then add the manual smoke workflow. Do not promote smoke to a required check until flakiness is measured down.

## Open Questions

- [ ] Should `ci:smoke` stay in a separate workflow file or become a manually dispatched job inside `ci.yml`?
- [ ] How should `origin/main` history be reconciled with the local initial baseline before required checks are enforced?
