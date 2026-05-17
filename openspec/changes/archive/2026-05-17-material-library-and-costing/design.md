# Design: material-library-and-costing

## Technical Approach

Keep `core-engine` geometry-only. Add a small read-only material catalog package, store only a selected material id on each workspace, and derive a rough material estimate from `calculateParts(...)` output plus the resolved catalog entry. Preview/export can surface that summary, but they never recalculate geometry.

## Architecture Decisions

| Decision | Options | Choice / Rationale |
|---|---|---|
| Material catalog home | `domain` vs new `material-catalog` package | **New package**. Catalog data is read-only seed data, not core domain logic, and this keeps it aligned with `template-starters` without polluting shared value objects. |
| Workspace selection shape | Full material snapshot vs `selectedMaterialId` | **`selectedMaterialId?: string`**. A reference avoids drift, makes validation simple, and keeps workspace persistence compact. |
| Costing location | `core-engine` vs adapter layer | **Adapter layer (`preview-export`)**. The engine stays responsible only for dimensions/parts; costing is a presentation-derived approximation built from engine output. |

## Data Flow

```text
GET /api/materials ──→ material-catalog
POST/PATCH workspace ──→ validate selectedMaterialId against catalog
workspace ──→ core-engine.calculateParts()
          └──→ preview-export.buildRoughCostSummary(parts, material)
                     ├──→ preview model (optional costSummary)
                     └──→ CSV/PDF export (optional cost lines)
```

Cost formula: sum `part.lengthMm * part.widthMm * part.quantity` to get total area, divide by `sheet.widthMm * sheet.heightMm`, round up to whole sheets, then multiply by `priceCentsPerSheet`. If engine output is missing/incomplete, return no summary.

## File Changes

| File | Action | Description |
|---|---|---|
| `packages/domain/src/material.ts` | Create | Material catalog and cost-summary types. |
| `packages/domain/src/workspace.ts` | Modify | Add `selectedMaterialId?: string` to workspace state. |
| `packages/domain/src/index.ts` | Modify | Re-export material and workspace selection types. |
| `packages/domain/package.json` | Modify | Expose the new material module. |
| `packages/material-catalog/*` | Create | Read-only approved catalog and lookup helpers. |
| `packages/workspace-crud/src/contracts.ts` / `use-cases.ts` | Modify | Round-trip selected material id through create/read/update. |
| `packages/preview-export/src/*` | Modify | Add rough-cost summary types/builders and surface optional summary in preview/export artifacts. |
| `packages/template-starters/src/catalog.ts` | Modify | Seed a default approved material id for starter workspaces. |
| `apps/web/src/flow.ts` / `http.ts` | Modify | Wire catalog lookup, validation, and `/api/materials`. |
| `apps/web/test/*` and package integration tests | Modify | Prove selection, summary, and read-only catalog behavior. |

## Interfaces / Contracts

```ts
export interface MaterialCatalogEntry {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly sheet: { readonly widthMm: number; readonly heightMm: number };
  readonly thicknessMm: number;
  readonly priceCentsPerSheet: number;
  readonly currency: "USD";
}

export interface RoughCostSummary {
  readonly approximate: true;
  readonly materialId: string;
  readonly materialName: string;
  readonly totalAreaMm2: number;
  readonly sheetAreaMm2: number;
  readonly estimatedSheetCount: number;
  readonly estimatedCostCents: number;
  readonly currency: "USD";
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Catalog read-only lookup, selection validation, cost formula | New package tests plus focused summary tests. |
| Integration | Workspace CRUD round-trips selected material id | Extend existing repository-backed CRUD tests. |
| Integration | Web flow/materials/preview/export wiring | Verify starter-seeded workspaces and summary propagation. |
| E2E | HTTP surface | Add `/api/materials` and preview/export checks to web smoke tests. |

## Migration / Rollout

No migration required. Existing workspaces can omit `selectedMaterialId`; the new field is optional and the summary is derived on demand.

## Open Questions

None.
