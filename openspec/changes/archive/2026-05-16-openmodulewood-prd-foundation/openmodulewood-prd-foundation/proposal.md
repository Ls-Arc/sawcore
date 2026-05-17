# Proposal: openmodulewood-prd-foundation

## Intent
Convert the source idea into an executable PRD foundation. The current material is a feature list; we need a phase-based contract with testable scope, clear non-goals, and a narrow v0.1 that can grow safely.

## Scope
### In Scope
- Define PRD-first phases and acceptance criteria.
- Freeze v0.1 around the core engine, starter templates, 2D preview, CSV/PDF export, and local Docker Compose run.
- Recommend repository and spec structure for future implementation.

### Out of Scope
- Full business workflows, cloud tenancy, payments, auth, and collaboration.
- Broad template libraries or production-grade rendering.
- Bun-first optimization or runtime migration now.

## Capabilities
### New Capabilities
- `core-engine`: deterministic parametric part calculation, units, and allowances.
- `workspace-crud`: create/read/update/delete a project and basic cabinet setup.
- `template-starters`: one or two starter cabinet templates.
- `preview-export`: simple 2D preview plus CSV/PDF export.
- `local-deployment`: Docker Compose local execution.

### Modified Capabilities
- None.

## Approach
- Use a **TypeScript monorepo** as the default architecture: shared domain model, isolated engine/exporter packages, and a thin UI layer.
- **Defer Bun** until the domain and test suite stabilize; prioritize Node-compatible tooling for exports and predictable ecosystem support.
- Build in phases: core engine first, then UI/workflow, then exports/deployment, then business/cloud later.

## Affected Areas
| Area | Impact | Description |
|---|---|---|
| `openspec/changes/openmodulewood-prd-foundation/proposal.md` | New | PRD foundation contract.
| `openspec/changes/openmodulewood-prd-foundation/specs/*/spec.md` | Future | Phase-specific delta specs.

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| Scope creep | High | Lock v0.1 to core engine + minimum usable flow.
| Domain ambiguity | Medium | Normalize units, allowances, and cabinet rules early.
| Export mismatch | Medium | Make export assertions derive from the engine outputs.

## Rollback Plan
If the scope proves too broad, keep the PRD and split the change into smaller specs centered on the core engine first; defer UI, export, and deployment slices without changing the foundational contract.

## Dependencies
- Exploration artifact for `openmodulewood-prd-foundation`.
- Baseline SDD context for `modulewood`.

## Success Criteria
- [ ] PRD foundation defines phases, non-goals, and measurable v0.1 boundaries.
- [ ] Architecture direction is explicit: TypeScript monorepo now, Bun later.
- [ ] Spec-ready capability names are listed for downstream `sdd-spec` work.
- [ ] Repo artifact structure is clear for hybrid persistence and future delta specs.
