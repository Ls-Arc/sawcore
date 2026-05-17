# Exploration: construction-rules-engine

### Current State
The current engine is a fixed carcass calculator, not a rules engine. `packages/core-engine/src/calculate-parts.ts` hardcodes one cabinet interpretation: left/right sides, top/bottom, and back are always derived with the same thickness and a single cut allowance.

The domain model is equally narrow. `packages/domain/src/cabinet-setup.ts` only carries width, height, depth, material thickness, and `allowances.cut`. There is no construction profile, no back fit mode, no door fit mode, and no per-part joinery metadata. Templates seed only that same cabinet setup, and web flow passes it straight into the engine.

### Affected Areas
- `packages/domain/src/cabinet-setup.ts` — needs a construction-rules shape, not just scalar dimensions.
- `packages/core-engine/src/calculate-parts.ts` — currently hardcodes carcass math; must read rules instead.
- `packages/core-engine/src/normalize-units.ts` and `validation.ts` — need to validate new rule inputs and rule-specific gaps/allowances.
- `packages/template-starters/src/catalog.ts` — templates will need a default rule profile to seed workspaces consistently.
- `packages/preview-export/src/*` — exports and preview should stay engine-driven, but will need to preserve any new rule metadata if part semantics change.
- `apps/web/src/flow.ts` and `apps/web/src/http.ts` — API payloads and flow types must carry the rule profile through CRUD, preview, and export.
- `packages/*/test/*` — add matrix tests for default and alternate construction modes.

### Approaches
1. **Finite construction profile on CabinetSetup** — add a typed `constructionRules` object with a small enum-like set of modes.
   - Pros: minimal, explicit, testable, fits current architecture.
   - Cons: introduces one more domain object and validation path.
   - Effort: Medium

2. **Generic rules DSL / engine** — model joinery as a rule graph or expression system.
   - Pros: highly flexible.
   - Cons: over-generalizes too early, expensive to test, and will slow the web flow/UI.
   - Effort: High

3. **Template-only presets with hardcoded engine defaults** — store presets in starter templates but keep the engine fixed.
   - Pros: quickest change.
   - Cons: not truly configurable; rules would be duplicated in templates rather than modeled.
   - Effort: Low

### Recommendation
Use a **finite construction profile** and keep it intentionally small.

The narrowest valuable first slice is: make carcass construction configurable enough to support real cabinet families without building a generic DSL. Start with a typed profile that can express:
- `topBottomBetweenSides` as the default carcass rule,
- `backPanelFit` as `overlay | inset`,
- explicit gap / allowance values as mm inputs,
- `doorFit` as a modeled but deferred rule until doors are first-class parts.

This gives product value immediately: the engine stops assuming one carcass geometry, templates can seed a predictable construction style, and preview/export remain derived from one source of truth.

### Risks
- Over-generalizing into a DSL before the product has multiple cabinet families will create complexity without value.
- Adding door rules before doors exist as first-class parts will produce dead configuration.
- Too many per-edge gap fields will explode test cases and UI choices.
- If the engine output shape changes too much, preview/export will drift from calculation semantics.

### Ready for Proposal
Yes — but the proposal should freeze v0.next around a small typed construction profile, not a universal cabinet rules engine.
