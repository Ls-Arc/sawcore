# Tasks: construction-rules-engine

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 220-320 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single batch |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Add typed construction profile, engine branching, starter defaults, and coverage | PR 1 | Single review slice; keep scope inside the finite profile |

## Phase 1: Domain model

- [x] 1.1 Create `packages/domain/src/construction-rules.ts` with `BackPanelFit`, `ConstructionRules`, and `DEFAULT_CONSTRUCTION_RULES`.
- [x] 1.2 Update `packages/domain/src/cabinet-setup.ts` and `packages/domain/src/index.ts` to attach/re-export `constructionRules` on `CabinetSetup`.

## Phase 2: Core engine rules

- [x] 2.1 Extend `packages/core-engine/src/normalize-units.ts` to default missing rules and normalize `allowances.cut` / `allowances.backInset` to mm.
- [x] 2.2 Extend `packages/core-engine/src/validation.ts` to reject unknown `backPanelFit` values and unsupported rule payloads.
- [x] 2.3 Update `packages/core-engine/src/calculate-parts.ts` to branch back-panel geometry on `backPanelFit` (`overlay` vs `inset`) and keep output deterministic.

## Phase 3: Templates and persistence wiring

- [x] 3.1 Seed `DEFAULT_CONSTRUCTION_RULES` into both starter templates in `packages/template-starters/src/catalog.ts`.
- [x] 3.2 Confirm `packages/workspace-crud/src/use-cases.ts` and `apps/web/src/flow.ts` preserve the expanded `CabinetSetup` shape end-to-end; adjust signatures only if TypeScript requires it.

## Phase 4: Tests / verification

- [x] 4.1 Add matrix tests in `packages/core-engine/test/calculate-parts.test.ts` for default overlay, explicit inset, invalid fit rejection, and missing-profile defaults.
- [x] 4.2 Update `packages/template-starters/test/catalog.integration.test.ts` and `packages/workspace-crud/test/workspace-crud.integration.test.ts` to assert seeded defaults and round-trip preservation of `constructionRules`.
- [x] 4.3 Extend `apps/web/test/web-flow.integration.test.ts` with a seeded workspace using `backPanelFit: "inset"` and verify preview/export still match engine output.
