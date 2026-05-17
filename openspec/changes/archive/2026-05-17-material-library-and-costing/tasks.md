# Tasks: material-library-and-costing

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~520-680 additions/deletions |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: domain + catalog + workspace persistence; PR 2: rough cost + HTTP + tests |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Add read-only material model + catalog + workspace selection storage | PR 1 | Safe base slice; no HTTP surface yet |
| 2 | Wire rough costing into preview/export and the web API | PR 2 | Depends on Unit 1 types and lookup helpers |

## Phase 1: Foundation

- [x] 1.1 Create `packages/domain/src/material.ts` and re-export it from `packages/domain/src/index.ts` and `packages/domain/package.json`.
- [x] 1.2 Extend `packages/domain/src/workspace.ts` with `selectedMaterialId?: string` and keep the workspace clone shapes aligned.
- [x] 1.3 Create `packages/material-catalog/src/catalog.ts`, `src/index.ts`, and `package.json` for the read-only approved catalog and lookup helpers.

## Phase 2: Core behavior

- [x] 2.1 Update `packages/workspace-crud/src/contracts.ts` and `src/use-cases.ts` so create/read/update round-trip `selectedMaterialId` without losing existing workspace state.
- [x] 2.2 Add `buildRoughCostSummary(...)` and optional `costSummary` support in `packages/preview-export/src/contracts.ts`, `preview.ts`, `csv.ts`, and `pdf.ts`.
- [x] 2.3 Seed a default approved `selectedMaterialId` in `packages/template-starters/src/catalog.ts` for starter workspaces.

## Phase 3: Integration / HTTP wiring

- [x] 3.1 Wire `apps/web/src/flow.ts` to resolve catalog entries, reject unknown `selectedMaterialId`, and attach the rough summary after `calculateParts(...)`.
- [x] 3.2 Add `GET /api/materials` in `apps/web/src/http.ts`; keep `POST /api/workspaces/:id/preview` and `POST /api/workspaces/:id/export/{csv,pdf}` as the natural verification surface for the summary.
- [x] 3.3 Thread `selectedMaterialId` through `POST /api/workspaces/from-template` and `PATCH /api/workspaces/:id` payloads in `apps/web/src/http.ts`.

## Phase 4: Testing / verification

- [x] 4.1 Add package tests for catalog immutability/lookup and workspace CRUD material round-trip only. Do NOT implement rough summary tests in this slice.
- [x] 4.2 Extend `apps/web/test/web-flow.integration.test.ts` and `apps/web/test/docker-compose-smoke.test.ts` to cover `/api/materials`, valid/invalid selection, and preview/export cost surfacing.
