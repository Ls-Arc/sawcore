# Tasks: openmodulewood-prd-foundation

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 700-950 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 domain+core + Bun bootstrap correction → PR 2 CRUD+templates → PR 3 preview/export+deployment |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|---|---|---|---|
| 1 | Stand up shared domain + deterministic core, then align Bun bootstrap | PR 1 | Base = main; include unit/allowance tests and Bun-first script/bootstrap correction. |
| 2 | Add workspace CRUD + starter catalog contracts | PR 2 | Depends on PR 1 types; keep persistence in-memory first. |
| 3 | Wire preview/export + local deployment scaffold | PR 3 | Consume engine output only; do not recompute in adapters. |

## Phase 1: Foundation / Infrastructure

- [x] 1.1 Create workspace scaffolding (`package.json`, `tsconfig.json`, package scripts) with Node-compatible tool entrypoints.
- [x] 1.2 Create `packages/domain/src/*` for `Unit`, `DimensionInput`, `CabinetSetup`, and `Workspace` value objects.
- [x] 1.3 Define package boundaries in the monorepo so `core-engine`, `workspace-crud`, `template-starters`, and `preview-export` stay isolated.
- [x] 1.4 Re-align the root bootstrap to Bun as the official path (`package.json` scripts, workspace entrypoints, and TS invocation), while keeping Node-compatible verification available.

## Phase 2: Core Implementation

- [x] 2.1 Implement `packages/core-engine/src/calculate-parts.ts` as a pure calculator that rejects invalid or ambiguous dimensions.
- [x] 2.2 Add `packages/core-engine/src/normalize-units.ts` and `packages/core-engine/src/validation.ts` for consistent units and allowances.
- [x] 2.3 Create `packages/workspace-crud/src/*` repository/use-case contracts for create, read, update, delete, and missing-workspace handling.
- [x] 2.4 Create `packages/template-starters/src/catalog.ts` with one or two approved templates and non-mutating seeding helpers.

## Phase 3: Integration / Wiring

- [x] 3.1 Wire `packages/preview-export/src/*` to consume engine output and build the 2D preview model plus CSV/PDF export facades.
- [x] 3.2 Add `apps/web/src/*` thin adapters that call workspace-crud, templates, engine, and export contracts.
- [x] 3.3 Add `infra/docker-compose.yml` and local start scripts for the v0.1 flow only.

## Phase 4: Testing / Verification

- [x] 4.1 Add unit tests for deterministic engine output, invalid-input rejection, and ambiguous-unit rejection.
- [x] 4.2 Add integration tests for workspace CRUD, template seeding, and export alignment with current workspace state.
- [x] 4.3 Add Docker Compose startup smoke checks and verify the local stack exposes only the approved v0.1 flow.
