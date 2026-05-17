# Exploration: real-world-validation-pack

### Current State
- The product already has a narrow but complete v0.1 flow: workspace CRUD, starter templates, approved materials, a deterministic cabinet engine, rough cost summary, preview, CSV/PDF export, and an HTTP API surface.
- The engine is still carcass-centric: it calculates left/right sides, top, bottom, and back from a `CabinetSetup` with typed construction rules (`overlay | inset`) and explicit allowances.
- Preview/export are pure consumers of engine output; cost is approximate and derived only from engine parts plus a selected approved material.
- That means the best validation pack is not “more algorithms first”; it is “real cabinet inputs through the current stack, with outputs captured at every layer.”

### Affected Areas
- `packages/core-engine/src/*` — engine fixture snapshots and rule/allowance behavior.
- `packages/preview-export/src/*` — preview, CSV, PDF, and rough-cost expectations.
- `apps/web/src/flow.ts` and `apps/web/src/http.ts` — full API flow validation.
- `packages/template-starters/src/catalog.ts` — starter-seeded workspace cases.
- `packages/material-catalog/src/catalog.ts` — material selection and cost summary inputs.
- `packages/*/test/*` — end-to-end and golden fixture coverage.

### Recommended First Fixtures
1. **Compact/base cabinet standard** — strongest baseline signal.
   - Confirms the canonical carcass shape already supported by the engine.
   - Use as the “golden happy path” for engine, preview, CSV, PDF, and API.

2. **Wall cabinet** — second highest value.
   - Proves the current model works for a realistic shallow upper cabinet, not just one base form.
   - Good regression check that depth changes do not disturb geometry or exports.

3. **Inset-back cabinet variant** — rule-path validation.
   - Confirms `constructionRules.backPanelFit = inset` and back inset allowances survive all layers.
   - This is the best case for catching rule normalization regressions.

4. **Width/material variation** — breadth within the same semantics.
   - Prefer one width step-up/step-down and one alternate approved material.
   - This validates that geometry changes alter part sizes and that cost summary tracks material choice.

5. **Starter + material-cost flow** — integration pack.
   - Seed from a starter template, select an approved material, preview, then export CSV/PDF.
   - This is the strongest “user journey” fixture because it exercises the API-first flow end to end.

### Expected Outputs to Capture
- **Engine**: `workspaceId`, `units`, `allowancesApplied`, and exact part breakdown (`id`, `name`, `quantity`, `lengthMm`, `widthMm`, `thicknessMm`, `allowanceMm`).
- **Preview**: `state`, `canvas`, part frames, and optional `costSummary` when material is selected.
- **CSV**: full text snapshot, including part rows and `roughCostSummary` rows when present.
- **PDF**: binary smoke check plus extracted text assertions for workspace, parts, and rough-cost lines.
- **API**: status codes and JSON payload shape for create/read/update/preview/export endpoints.

### Where These Should Live
- **Tests**: yes, absolutely — they are the enforcement layer.
- **Fixture files**: yes — keep the real cabinet inputs and expected outputs stable and reviewable.
- **Docs**: yes — explain why each case exists and what it proves, so future algorithm changes do not erase intent.

### Approaches
1. **Thin realistic pack** — 4-5 fixtures, each covering a distinct semantic slice.
   - Pros: high signal, low maintenance, less overfitting.
   - Cons: not exhaustive.
   - Effort: Low

2. **Matrix-heavy pack** — many widths/materials/rule combinations.
   - Pros: broader regression coverage.
   - Cons: easy to overfit to snapshots; expensive to update.
   - Effort: Medium

3. **Docs-only example library** — publish cabinet cases without executable fixtures.
   - Pros: cheap to write.
   - Cons: no guardrail; weak validation signal.
   - Effort: Low

### Recommendation
Use **Approach 1** and keep the pack intentionally small.

For MVP validation, start with **compact/base**, **wall cabinet**, **inset-back**, and **one starter-driven material-cost journey**. Add **one width/material variation** only if it comes from real measurements and not synthetic “coverage for coverage’s sake.”

The proposal should frame this as a **validation pack**, not an algorithm expansion: the goal is to prove the current stack handles realistic cabinet inputs end-to-end before geometry, costing, or export logic gets smarter.

### Risks
- Overfitting snapshots to current implementation details instead of cabinet intent.
- Adding too many permutations before the product has more cabinet families or rules.
- Treating approximate costing as production pricing, which would create false confidence.
- Letting fixture maintenance become a burden by capturing incidental ordering or formatting instead of stable invariants.

### Ready for Proposal
Yes — propose a small hybrid validation pack with executable tests, fixture files, and short docs. Keep the scope centered on realistic cabinets and honest approximate outputs, not new algorithms.
