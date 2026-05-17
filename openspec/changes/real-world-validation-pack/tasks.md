# Tasks: real-world-validation-pack

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | ~280-360 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|---|---|---|---|
| 1 | Add shared validation-fixtures package | PR 1 | `packages/validation-fixtures/package.json`, `packages/validation-fixtures/tsconfig.json`, `src/real-world-validation-pack.ts`, `src/index.ts` |
| 2 | Rewire package tests to frozen cases | PR 1 | `packages/core-engine/test/calculate-parts.test.ts`, `packages/workspace-crud/test/workspace-crud.integration.test.ts`, `packages/preview-export/test/preview-export.integration.test.ts` |
| 3 | Add web/API validation on same fixtures | PR 1 | `apps/web/test/web-flow.integration.test.ts`, `apps/web/test/http.integration.test.ts` |

## Phase 1: Shared Fixture Foundation

- [x] 1.1 Create `packages/validation-fixtures/package.json` and `packages/validation-fixtures/tsconfig.json`; add `@modulewood/validation-fixtures` to root `tsconfig.json` paths/references.
- [x] 1.2 Add `packages/validation-fixtures/src/real-world-validation-pack.ts` with the four frozen cases: compact/base, wall cabinet, inset-back, and starter-seeded material-selected journey.
- [x] 1.3 Add `packages/validation-fixtures/src/index.ts` to re-export typed fixtures and any stable-invariant helper types used by tests.

## Phase 2: Core Consumer Coverage

- [x] 2.1 Refactor `packages/core-engine/test/calculate-parts.test.ts` to use the shared compact/base, wall, and inset-back fixtures; assert deterministic part ids/counts/dimensions only.
- [x] 2.2 Refactor `packages/workspace-crud/test/workspace-crud.integration.test.ts` to seed/read/update the shared starter journey and preserve `selectedMaterialId` plus cabinet setup.
- [x] 2.3 Refactor `packages/preview-export/test/preview-export.integration.test.ts` to validate preview state, canvas bounds, part count, CSV, and PDF facts from the shared journey.

## Phase 3: Web/API Wiring

- [x] 3.1 Refactor `apps/web/test/web-flow.integration.test.ts` to consume the same shared journey fixture and compare preview/export payload facts against stable invariants.
- [x] 3.2 Add `apps/web/test/http.integration.test.ts` covering `/api/flow`, `/api/workspaces/from-template`, preview, CSV, PDF, and 404/422 responses for the frozen journey.

## Phase 4: Cleanup and Verification

- [x] 4.1 Add brief intent comments in `packages/validation-fixtures/src/real-world-validation-pack.ts` explaining what each frozen case proves and which invariants must stay stable.
- [x] 4.2 Run `bun test`, `bun run typecheck`, and `bun run build`; fix any path-reference or cross-package import breakages before handing off.
