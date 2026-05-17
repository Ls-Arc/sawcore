# Exploration: material-library-and-costing

### Current State
- The domain already carries enough geometry to estimate material usage: `CabinetSetup` has width, height, depth, `materialThickness`, and a small construction profile (`backPanelFit`, cut/backInset allowances).
- The core engine returns a deterministic part list with `lengthMm`, `widthMm`, `quantity`, `thicknessMm`, and `allowanceMm`.
- Preview/export are pure consumers of engine output; they do not own any material or pricing logic.
- What is missing is a material model, a material library, any cost field, any currency, any sheet-stock concept, and any BOM or per-part purchasing model.

### Affected Areas
- `packages/domain/src/*` — needs a material entity/selection shape if materials become first-class.
- `packages/core-engine/src/*` — likely unchanged for the first slice; it already produces enough geometry for rough costing.
- `packages/preview-export/src/*` — can surface cost summaries without recalculating geometry.
- `packages/template-starters/src/catalog.ts` — starter workspaces may need a default material selection.
- `packages/workspace-crud/src/*` and `apps/web/src/flow.ts` — workspace state must round-trip selected material data.
- `apps/web/src/http.ts` and tests — API payloads and fixtures will need the new fields.

### Approaches
1. **Read-only material catalog + rough estimate** — add a small curated library of sheet goods, select one material per workspace, and estimate cost from current engine parts.
   - Pros: smallest useful slice; keeps engine untouched; honest about approximation.
   - Cons: no nesting, no offcuts, no labor, no multi-material jobs.
   - Effort: Low/Medium

2. **Part-level BOM and pricing** — assign material/cost metadata to each part line and export a richer bill of materials.
   - Pros: more explicit for purchasing and reporting.
   - Cons: bigger domain surface; still not real optimization; easier to overstate precision.
   - Effort: Medium/High

3. **Optimization-driven costing** — compute sheet nesting, grain direction, and cut plans before costing.
   - Pros: closer to production reality.
   - Cons: too much model, too early; explodes complexity in engine, UI, and tests.
   - Effort: High

### Recommendation
Use **Approach 1** for the proposal.

Keep the first slice to a **read-only material catalog plus a workspace-selected material**. Cost should be derived from the current engine output as a **rough sheet-goods estimate**, not a production cut plan:
- derive part area from `lengthMm × widthMm × quantity`
- sum total area for the cabinet
- compare it to the selected material sheet area
- compute an explicit **rough** sheet count and material total

That avoids fake precision while still adding real product value. The proposal should keep the engine as the single geometry source and layer costing on top of it.

### Candidate Material Fields
Keep for v1:
- `id`
- `name`
- `type` (sheet good / panel / solid surface, etc.)
- `color` / finish label
- `thicknessMm`
- `sheetWidthMm` / `sheetHeightMm`
- `sheetCost`

Stay out for now:
- supplier / vendor / SKU
- currency conversion
- labor, tax, discounts
- grain direction and edge-banding rules
- offcut inventory
- detailed BOM by fastener/hardware
- cut optimization / nesting / yield modeling

### Risks
- Sheet nesting and grain direction will create false confidence if we pretend area-based costing is production-accurate.
- Adding a full BOM too early will widen the model before the product has a stable procurement workflow.
- If material data is duplicated between templates, workspaces, and exports, it will drift quickly.
- Preview/export should not become a second calculation engine; they must stay derived from engine output plus a thin costing summary.

### Ready for Proposal
Yes — the proposal should frame this as **material library + rough costing**, with explicit non-goals for optimization, advanced BOM, and production-grade purchasing precision.
