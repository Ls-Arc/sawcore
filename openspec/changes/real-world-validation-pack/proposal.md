# Proposal: real-world-validation-pack

## Intent

Prove the current MVP-adjacent stack with a small set of real cabinet cases. This is a validation change, not an algorithm change: we want honest end-to-end confidence in the existing engine, rules, starters, materials, preview/export, and API flow.

## Scope

### In Scope
- Golden validation fixtures for a compact/base cabinet, a wall cabinet, and an inset-back variant.
- One starter-seeded, material-selected journey that exercises create/read/update, preview, CSV, and PDF.
- Stable fixture docs explaining what each case proves and why it exists.

### Out of Scope
- New geometry, nesting, optimization, or costing algorithms.
- More cabinet families, broader width/material matrices, or exhaustive combinatorics.
- Production pricing, BOM depth, procurement, labor, tax, or offcut logic.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- None.

## Approach

Keep the current engine and adapters unchanged. Add a thin, reviewable pack of real-world fixtures plus assertions that cover the current pipeline from starter/workspace input to exports. Prefer invariant checks over brittle snapshots; capture only stable outputs needed to prove the flow.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/core-engine/test/*` | Modified | Golden cases for base, wall, and inset-back carcass output. |
| `packages/preview-export/test/*` | Modified | Validate preview/CSV/PDF against engine output and selected material. |
| `packages/workspace-crud/test/*` | Modified | Round-trip starter-seeded workspace cases and selections. |
| `apps/web/test/*` | Modified | HTTP/API flow validation for the starter-driven journey. |
| `openspec/changes/real-world-validation-pack/*` | New | Proposal, fixtures notes, and later verification artifacts. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Fixtures drift into implementation-detail snapshots | Med | Assert cabinet intent and stable invariants, not incidental ordering. |
| Pack grows into a broad matrix | Med | Freeze at a small representative set; defer coverage expansion. |

## Rollback Plan

Remove the new validation fixtures/docs and revert the added tests. No product code rollback should be required because this change does not alter runtime behavior.

## Dependencies

- Existing deterministic engine output.
- Approved starter templates, approved materials, and current preview/export/API flow.

## Success Criteria

- [ ] The pack covers the four frozen cases end to end.
- [ ] Tests prove the current stack works with real cabinet inputs without new algorithms.
- [ ] Fixtures and docs stay small, explicit, and easy to update.
