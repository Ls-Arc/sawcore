# Proposal: starter-cabinet-expansion

## Intent

Raise MVP value by making the starter catalog cover the most common real kitchen families without changing the carcass engine. Wall cabinets unlock the biggest missing user workflow; drawers and door/front semantics stay deferred.

## Scope

### In Scope
- Add a wall-cabinet starter as a plain carcass template using existing engine output.
- Keep the catalog capped at two starters by swapping out the least valuable starter (`tall-pantry`) and clarifying the base starter as the companion preset.
- Add fixture-backed validation cases so starter templates are proven through workspace seed, CRUD round-trip, and engine-driven preview/export.

### Out of Scope
- Drawer-first-class modeling, door semantics, or any front/hardware system.
- Raising the starter cap above two.
- New carcass geometry rules or preview/export logic.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `template-starters`: approved starter set now includes a wall-cabinet starter; catalog remains capped at two.
- `workspace-crud`: seeded workspace fixtures must round-trip the revised starter set.
- `preview-export`: validation must prove starter-seeded workspaces still render/export from engine output only.

## Approach

Keep everything carcass-only: reuse the current rectangular setup, seed wall cabinet dimensions and defaults from the starter catalog, and prove usefulness with real fixtures instead of broader model changes. Preserve determinism and engine-driven preview/export.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/template-starters/src/catalog.ts` | Modified | Replace `tall-pantry` with wall cabinet starter |
| `packages/template-starters/test/catalog.integration.test.ts` | Modified | Assert new catalog composition and immutability |
| `packages/workspace-crud/test/workspace-crud.integration.test.ts` | Modified | Seed/round-trip the new starter pair |
| `packages/preview-export/test/preview-export.integration.test.ts` | Modified | Validate starter-seeded engine output stays exportable |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Users infer drawer/door support from richer starters | Med | Explicitly defer those models in scope/out-of-scope |
| Starter set becomes less useful if the swap is wrong | Med | Keep base + wall as the two real MVP presets |
| Spec drift from the current 1–2 starter cap | Low | Preserve the cap; do not add a third template |

## Rollback Plan

Restore the current `compact-base` + `tall-pantry` catalog, revert starter-backed fixtures/tests, and leave the engine plus preview/export pipeline unchanged.

## Dependencies

- Current carcass-only engine and workspace seed flow.
- Existing approved starter-template baseline.

## Success Criteria

- [ ] The starter catalog includes a wall-cabinet starter and stays at two templates.
- [ ] Validation fixtures prove starter-seeded workspaces create, update, and export cleanly.
- [ ] No drawer/door first-class model is introduced.
