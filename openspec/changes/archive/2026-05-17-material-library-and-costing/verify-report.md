## Verification Report

**Change**: material-library-and-costing (full change)
**Version**: N/A
**Mode**: Standard

### Completeness
| Metric | Value |
|--------|-------|
| Tasks total | 11 |
| Tasks complete | 11 |
| Tasks incomplete | 0 |

### Build & Tests Execution
**Build**: ✅ Passed
```text
Command: bun run typecheck
Result: Pass (bunx tsc -b --pretty false)
```

**Tests**: ✅ 56 passed / ❌ 0 failed / ⚠️ 0 skipped
```text
Command: bun test packages/material-catalog/test/catalog.integration.test.ts packages/workspace-crud/test/workspace-crud.integration.test.ts packages/template-starters/test/catalog.integration.test.ts apps/web/test/web-flow.integration.test.ts
Result: 11 pass, 0 fail

Command: bun test apps/web/test/docker-compose-smoke.test.ts
Result: 2 pass, 0 fail

Command: bun run test
Result: 43 pass, 0 fail
```

**Coverage**: ➖ Not available (no coverage threshold configured)

### Spec Compliance Matrix (Spec first)
| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| material-catalog: Catalog is read-only and limited | List approved materials | `packages/material-catalog/test/catalog.integration.test.ts > approved material catalog is immutable across lookups` | ✅ COMPLIANT |
| material-catalog: Catalog is read-only and limited | Mutations are rejected | `packages/material-catalog/test/catalog.integration.test.ts > approved material lookup returns stable copies and rejects unknown ids` + static API check (`list/get/require` only) | ✅ COMPLIANT |
| workspace-material-selection: Workspace stores one selected material | Select a catalog material | `packages/workspace-crud/test/workspace-crud.integration.test.ts > workspace CRUD supports seeded workspaces and current-state updates` | ✅ COMPLIANT |
| workspace-material-selection: Workspace stores one selected material | Replace the selection | `packages/workspace-crud/test/workspace-crud.integration.test.ts > workspace CRUD supports seeded workspaces and current-state updates` | ✅ COMPLIANT |
| workspace-material-selection: Workspace stores one selected material | Reject non-catalog ids | `apps/web/test/web-flow.integration.test.ts > web flow rejects unknown selected materials` + `apps/web/test/docker-compose-smoke.test.ts` (422 on invalid create payload) | ✅ COMPLIANT |
| rough-cost-summary: Approximate cost summary is derived from engine output | Summarize cost for a valid workspace | `packages/preview-export/test/preview-export.integration.test.ts > preview-export derives an approximate rough cost summary from the engine output` + `apps/web/test/web-flow.integration.test.ts > web flow wires workspace CRUD, templates, engine, and exports` | ✅ COMPLIANT |
| rough-cost-summary: Approximate cost summary is derived from engine output | Missing engine output blocks summary | `packages/preview-export/test/preview-export.integration.test.ts > preview-export skips rough cost summaries when the input is incomplete` | ✅ COMPLIANT |
| workspace-crud (delta): Workspace lifecycle is supported | Create and retrieve a workspace | `packages/workspace-crud/test/workspace-crud.integration.test.ts > workspace CRUD supports seeded workspaces and current-state updates` | ✅ COMPLIANT |
| workspace-crud (delta): Workspace lifecycle is supported | Delete removes the workspace | `packages/workspace-crud/test/workspace-crud.integration.test.ts > workspace CRUD supports seeded workspaces and current-state updates` | ✅ COMPLIANT |
| workspace-crud (delta): Basic cabinet setup is editable | Update cabinet setup and selected material | `packages/workspace-crud/test/workspace-crud.integration.test.ts > workspace CRUD supports seeded workspaces and current-state updates` | ✅ COMPLIANT |
| workspace-crud (delta): Basic cabinet setup is editable | Missing workspace is handled safely | `packages/workspace-crud/test/workspace-crud.integration.test.ts > workspace CRUD reports missing workspaces safely` | ✅ COMPLIANT |
| workspace-crud (delta): Basic cabinet setup is editable | Unsupported rules are rejected on update | `packages/core-engine/test/calculate-parts.test.ts > calculateParts rejects unsupported construction rule values` + `apps/web/src/http.ts` returns 422 for `CalculationError` | ✅ COMPLIANT |
| preview-export (delta): 2D preview reflects the current workspace | Preview matches current state | `packages/preview-export/test/preview-export.integration.test.ts > preview-export builds a 2D model from engine output only` + `apps/web/test/web-flow.integration.test.ts > web flow wires workspace CRUD, templates, engine, and exports` | ✅ COMPLIANT |
| preview-export (delta): 2D preview reflects the current workspace | Empty workspace is handled | `apps/web/test/web-flow.integration.test.ts > web flow keeps preview non-breaking when the engine rejects input` | ✅ COMPLIANT |
| preview-export (delta): CSV and PDF export are available | Export succeeds for a valid workspace | `packages/preview-export/test/preview-export.integration.test.ts > preview-export produces CSV and PDF artifacts from the same engine result` + `apps/web/test/docker-compose-smoke.test.ts` | ✅ COMPLIANT |
| preview-export (delta): CSV and PDF export are available | Export requires a valid current state | `apps/web/test/web-flow.integration.test.ts > web flow keeps preview non-breaking when the engine rejects input` | ✅ COMPLIANT |

**Compliance summary**: 16/16 scenarios compliant

### Correctness (Static Evidence)
| Requirement | Status | Notes |
|------------|--------|-------|
| Catalog remains read-only | ✅ Implemented | `packages/material-catalog/src/catalog.ts` exports list/get/require only; cloned responses prevent mutation leaks. |
| Workspace selected material round-trips | ✅ Implemented | `packages/domain/src/workspace.ts` + `packages/workspace-crud/src/contracts.ts` + `use-cases.ts` carry `selectedMaterialId`. |
| Rough costing stays approximate | ✅ Implemented | `buildRoughCostSummary` marks `approximate: true`, uses sheet-area estimate only, no BOM/labor/tax logic. |
| Preview/export remain geometry-derived | ✅ Implemented | `apps/web/src/flow.ts` computes `calculateParts(...)` first, then passes result to preview/export builders. |
| `/api/materials` exists | ✅ Implemented | `apps/web/src/http.ts` handles `GET /api/materials`; endpoint listed in `APPROVED_FLOW`; exercised in docker smoke test. |
| `selectedMaterialId` validation works | ✅ Implemented | `resolveSelectedMaterial` calls `requireApprovedMaterial`; invalid ids yield `UnsupportedMaterialError` and HTTP 422. |

### Coherence (Design second)
| Decision | Followed? | Notes |
|----------|-----------|-------|
| Material catalog in dedicated package | ✅ Yes | Implemented in `packages/material-catalog`. |
| Workspace stores only `selectedMaterialId` reference | ✅ Yes | No material snapshot is persisted in workspace state. |
| Rough costing belongs to adapter layer, not engine | ✅ Yes | `packages/preview-export/src/contracts.ts` owns cost summary builder; `core-engine` unchanged for cost logic. |

### Task Alignment (Tasks third)
| Task | State | Verification note |
|------|-------|-------------------|
| 1.1 | ✅ Done | `packages/domain/src/material.ts` added and exported. |
| 1.2 | ✅ Done | `selectedMaterialId?: string` added to workspace model. |
| 1.3 | ✅ Done | Read-only catalog + helpers implemented in `packages/material-catalog`. |
| 2.1 | ✅ Done | CRUD create/read/update preserve selected material id. |
| 2.2 | ✅ Done | Rough cost summary + optional surfacing in preview/CSV/PDF implemented. |
| 2.3 | ✅ Done | Starter seeding defaults to `DEFAULT_APPROVED_MATERIAL_ID`. |
| 3.1 | ✅ Done | Web flow validates material id and attaches summary after engine output. |
| 3.2 | ✅ Done | `GET /api/materials` implemented and tested through smoke. |
| 3.3 | ✅ Done | `selectedMaterialId` threaded through from-template and patch payloads. |
| 4.1 | ✅ Done | Catalog immutability/lookup + CRUD round-trip tests present and passing. |
| 4.2 | ✅ Done | Web flow + docker smoke tests cover materials endpoint, invalid ids, and preview/export summary surfacing. |

### Issues Found
**CRITICAL**: None

**WARNING**: None

**SUGGESTION**:
- Add a direct assertion for starter default `selectedMaterialId` in `packages/template-starters/test/catalog.integration.test.ts` to make this behavior explicit at package level.

### Verdict
PASS

All declared requirements and planned tasks for `material-library-and-costing` are implemented and backed by passing runtime evidence.
