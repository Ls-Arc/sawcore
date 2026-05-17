# Exploration: starter-cabinet-expansion

### Current State
- The starter catalog currently has two templates: `compact-base` and `tall-pantry`.
- The approved starter-spec still says the set MUST stay small and contain one or two templates.
- The domain only models a generic `CabinetSetup` plus optional `ConstructionRules`; there is no cabinet-family type.
- The core engine calculates a single rectangular carcass: left/right sides, top, bottom, and back. It supports only overlay/inset back panels and cut/backInset allowances.
- Preview/export are engine-driven only, so any starter that remains a simple carcass will flow through without extra preview/export logic.

**Candidate evaluation**
- **Wall cabinet** — highest product value next. It fills the biggest missing real-world kitchen family and still fits the current engine model.
- **Improved base cabinet variants** — good value if they are just better presets (for example, standard base / sink base dimensions), but they are less product-defining than wall cabinets.
- **Tall pantry** — already present, so it is not the next expansion target.
- **Drawer cabinet** — defer. The current model has no drawer/front semantics, so this becomes a larger engine/domain change.

### Affected Areas
- `openspec/specs/template-starters/spec.md` — the current 1-2 template cap will need a deliberate decision if the catalog grows or if a starter is swapped.
- `packages/template-starters/src/catalog.ts` — template catalog content and starter defaults.
- `packages/template-starters/test/catalog.integration.test.ts` — assertions on template count/ids and immutability.
- `packages/workspace-crud/test/workspace-crud.integration.test.ts` — seed fixture expectations if the recommended starter pair changes.
- `packages/core-engine/src/*` — only affected if a new template requires a non-carcass family shape; wall/base variants do not.
- `packages/preview-export/src/*` — no direct code change expected for carcass-only starters; tests should still prove it remains engine-derived.
- `packages/preview-export/test/*` — add coverage that new starter shapes still preview/export from engine output only.

### Approaches
1. **Wall cabinet-first refresh** — make wall cabinet the next starter and keep it as a plain carcass template.
   - Pros: highest MVP value; validates upper-cabinet workflows; no engine redesign.
   - Cons: if the set stays capped at two, one existing starter likely needs to be replaced.
   - Effort: Low

2. **Base-family refinement** — replace the weakest starter with a more realistic base variant (or a small base-family set).
   - Pros: fully supported by current engine; easy to test; improves realism without new semantics.
   - Cons: less product differentiation than wall cabinets.
   - Effort: Low

3. **Drawer cabinet expansion** — add drawers/fronts as a new starter family.
   - Pros: strong realism for users who expect storage breakdowns.
   - Cons: current domain/engine does not model drawers, so this would spill into a broader architecture change.
   - Effort: High

### Recommendation
Do a **wall cabinet-first proposal**, and keep the implementation slice carcass-only.

The narrowest useful step is to add a wall cabinet starter and pair it with the most representative base starter(s), while explicitly deferring drawer cabinets. If the team wants to preserve the current spec cap of one or two templates, the proposal should swap out the least valuable starter instead of widening the catalog blindly. If the team wants a third starter, the proposal must first amend `template-starters` to raise the approved cap.

### Risks
- Growing the catalog faster than the engine model creates a false sense of capability; users may think drawers/doors are supported when they are not.
- If the proposal ignores the current 1-2 starter cap, it will conflict with the existing starter-spec and create spec drift.
- A drawer-first direction would force preview/export and tests to chase a moving part model.
- Too many starter presets without a stronger domain model will add maintenance cost without increasing validation quality.

### Ready for Proposal
Yes — but the proposal should stay strict: wall cabinet first, base variants second, drawer cabinets later, and the starter-spec cap must be resolved up front.
