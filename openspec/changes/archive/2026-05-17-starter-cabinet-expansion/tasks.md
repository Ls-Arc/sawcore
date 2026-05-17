# Tasks: starter-cabinet-expansion

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~120-170 additions/deletions |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single batch |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Swap the approved starter pair and refresh dependent coverage | Single batch | Keep the change narrow: catalog + fixtures/tests only |

## Phase 1: Starter Catalog Update

- [x] 1.1 Replace `tall-pantry` with `wall-cabinet` in `packages/template-starters/src/catalog.ts`, keeping `compact-base` and clone-on-read behavior intact.
- [x] 1.2 Preserve the plain `CabinetSetup` model and seed the wall cabinet with the design dimensions/defaults (`80cm × 72cm × 35cm`, `18mm`, `2mm`, default construction rules).

## Phase 2: Fixture and Integration Coverage

- [x] 2.1 Update `packages/template-starters/test/catalog.integration.test.ts` to assert exactly two ids (`compact-base`, `wall-cabinet`) and catalog immutability.
- [x] 2.2 Update `packages/workspace-crud/test/workspace-crud.integration.test.ts` to seed from `wall-cabinet` and verify create/read/update/delete preserves seeded construction rules.
- [x] 2.3 Update `packages/preview-export/test/preview-export.integration.test.ts` to build preview/CSV/PDF from a starter-seeded workspace via engine output only.
- [x] 2.4 Update `apps/web/test/web-flow.integration.test.ts` to confirm the web flow lists the approved pair and seeds the new wall starter correctly.

## Phase 3: Verification

- [x] 3.1 Run the targeted package tests for `template-starters`, `workspace-crud`, `preview-export`, and `apps/web`.
- [x] 3.2 Confirm no drawer/door semantics or third starter template leak into the updated fixtures.
