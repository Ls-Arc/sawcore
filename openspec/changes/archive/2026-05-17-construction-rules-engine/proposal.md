# Proposal: construction-rules-engine

## Intent

Replace the fixed carcass calculator with a small typed construction profile so the product can model real cabinet families without jumping to a generic DSL. Prioritize engine correctness and shared defaults first; UI breadth follows the model.

## Scope

### In Scope
- Add a typed `constructionRules` object to `CabinetSetup`.
- Support `backPanelFit` as `overlay | inset`, plus a limited set of explicit gap / allowance fields.
- Seed starter templates with a default construction profile.
- Update validation and calculation to consume the profile deterministically.

### Out of Scope
- Generic DSL, rule graph, or expression engine.
- Door-rule modeling before doors are first-class output parts.
- Per-edge / per-hardware deep configuration.
- CNC, production, or optimization logic.

## Capabilities

### New Capabilities
- `construction-rules-profile`: typed construction profile, defaults, and limited fit/allowance modes.

### Modified Capabilities
- `core-engine`: calculate from construction rules instead of fixed carcass assumptions.
- `template-starters`: seed default construction profiles in starter templates.
- `workspace-crud`: persist the expanded cabinet setup shape through create/update.

## Approach

Use a finite enum-based profile at the domain boundary, normalize dimensions to mm before calculation, and keep the preview/export pipeline engine-driven. The first slice should preserve current output determinism while making carcass geometry configurable.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/domain/src/cabinet-setup.ts` | Modified | Add `constructionRules` and limited allowance fields |
| `packages/core-engine/src/calculate-parts.ts` | Modified | Consume construction rules in carcass math |
| `packages/core-engine/src/normalize-units.ts` / `validation.ts` | Modified | Validate rule inputs and defaults |
| `packages/template-starters/src/catalog.ts` | Modified | Seed templates with the default profile |
| `packages/workspace-crud/src/*.ts` | Modified | Persist the new cabinet setup shape |
| `apps/web/src/flow.ts` / `apps/web/src/http.ts` | Modified | Carry the profile through CRUD and export flows |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Scope expands into a DSL too early | Med | Freeze the finite profile and reject generic rule modeling |
| Door rules arrive before doors exist | Med | Defer door fit behavior until parts are first-class |
| Preview/export drifts from engine semantics | Low | Keep one calculation source of truth |

## Rollback Plan

Remove the new `constructionRules` fields, keep the existing scalar cabinet setup, and restore the current carcass math and starter defaults.

## Dependencies

- Current v0.1 baseline in `core-engine`, `workspace-crud`, and `template-starters`.
- Existing exploration for `construction-rules-engine`.

## Success Criteria

- [ ] A workspace can store and round-trip a typed construction profile.
- [ ] The engine calculates deterministically from the profile.
- [ ] Starter templates seed the default profile.
- [ ] No generic DSL or production/CNC logic is introduced.
