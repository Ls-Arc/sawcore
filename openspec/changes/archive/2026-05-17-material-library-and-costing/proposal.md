# Proposal: material-library-and-costing

## Intent

Add a narrow v0.1 material layer so a workspace can choose one material from a read-only catalog and show a rough cost estimate. This delivers real product value without pretending to solve procurement, nesting, or full BOM planning.

## Scope

### In Scope
- Read-only curated material catalog for approved sheet goods.
- Workspace-selected material that round-trips with workspace state.
- Rough, approximate costing derived only from current engine output.

### Out of Scope
- Cut optimization, nesting, grain direction, yield modeling.
- Deep BOMs, hardware/fastener purchasing, procurement workflows.
- Labor, tax, discounts, currency conversion, offcut inventory.

## Capabilities

### New Capabilities
- `material-catalog`: expose a small read-only library of materials.
- `workspace-material-selection`: persist the selected material on a workspace.
- `rough-cost-summary`: compute an approximate material cost from engine parts only.

### Modified Capabilities
- `workspace-crud`: workspace payloads now include selected material data.
- `preview-export`: preview/export may surface derived cost totals, but never recalculate geometry.

## Approach

Keep `core-engine` unchanged. Store material metadata as a small approved catalog, let the workspace reference one material id, and derive a rough sheet-based estimate from engine part area plus material sheet size/cost. Preview/export consumes that summary; it does not own costing logic.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/domain/src/*` | Modified | Add material and selected-material shapes. |
| `packages/workspace-crud/src/*` | Modified | Round-trip selected material in workspace state. |
| `packages/preview-export/src/*` | Modified | Surface cost summary from derived engine output. |
| `packages/template-starters/src/catalog.ts` | Modified | Seed a default material choice for new workspaces. |
| `apps/web/src/http.ts` | Modified | Update API payloads/fixtures for new fields. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Rough costing is mistaken for production pricing | Med | Label it explicitly approximate and derived only from engine output. |
| Workspace/material state drifts across layers | Low | Keep material selection as a single workspace reference. |

## Rollback Plan

Remove the material fields from workspace/API responses and hide the cost summary while leaving engine geometry unchanged. Existing workspaces can ignore the material reference without data loss.

## Dependencies

- Existing deterministic engine part output.
- Approved workspace persistence and starter seeding.

## Success Criteria

- [ ] A workspace can select and retrieve a material from the catalog.
- [ ] Preview/export shows a rough material estimate derived from engine output only.
- [ ] No optimization, BOM depth, labor/tax, or procurement logic is introduced.
