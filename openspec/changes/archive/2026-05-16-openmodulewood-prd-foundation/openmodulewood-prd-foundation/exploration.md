# Exploration: openmodulewood-prd-foundation

### Current State
The source idea is strong but still a feature inventory, not yet an executable PRD. It mixes product vision, MVP scope, future roadmap, and implementation hints; the right transformation is to convert it into a phase-based contract with explicit non-goals, testable acceptance criteria, and a narrow v0.1 boundary.

The best foundation scope is: project CRUD, one or two starter cabinet templates, parametric dimensions, a deterministic part-calculation core, a simple 2D preview, CSV/PDF export, and a local Docker Compose deployment.

### Affected Areas
- `openspec/changes/openmodulewood-prd-foundation/exploration.md` — this exploration artifact.
- `openspec/changes/openmodulewood-prd-foundation/proposal.md` — next phase should turn the foundation into a PRD proposal.
- `openspec/changes/openmodulewood-prd-foundation/specs/<domain>/spec.md` — future testable delta specs.
- `openspec/changes/openmodulewood-prd-foundation/design.md` — architecture decisions after scope is approved.
- `openspec/changes/openmodulewood-prd-foundation/tasks.md` — implementation slices once the proposal/spec are accepted.
- `openspec/changes/openmodulewood-prd-foundation/verify-report.md` — phase verification later.
- `openspec/config.yaml` — repo-wide SDD rules to add once the repo is initialized.
- `openspec/specs/` and `openspec/changes/archive/` — root folders for long-lived specs and archived changes.

### Approaches
1. **Direct feature backlog PRD** — keep the source document as a big roadmap and add tasks as needed.
   - Pros: fastest to start.
   - Cons: weak testability, high scope creep, hard to review.
   - Effort: Low

2. **Phase-first PRD foundation** — define MVP v0.1, non-goals, success metrics, and domain slices before writing specs.
   - Pros: executable, measurable, good fit for an empty repo, supports future phases cleanly.
   - Cons: requires upfront product/architecture thinking.
   - Effort: Medium

3. **TypeScript monorepo from day 1** — split core, templates, exporters, and web into packages, with a shared domain model.
   - Pros: strongest fit for the user’s TS strength, shared types, clear boundaries.
   - Cons: slightly more setup than a single package.
   - Effort: Medium

### Recommendation
Use the phase-first PRD foundation as the product approach, and implement it in a TypeScript monorepo.

**Bun recommendation:** adopt Bun later, not as the primary foundation today. The core domain is more important than runtime novelty, and exporter/PDF/cross-platform tooling tends to benefit from Node-compatible maturity first. Bun can be introduced once the domain model and test suite are stable, either for developer ergonomics or specific performance wins.

For the next proposal phase, freeze a narrow MVP v0.1 around the parametric despiece engine and the minimum usable flow: create project, configure one base cabinet, generate parts, preview 2D, export CSV/PDF, and run locally via Docker Compose.

### Risks
- Scope creep: the source idea includes a much larger roadmap than the MVP can safely absorb.
- Domain ambiguity: cabinet construction rules, units, and allowances can explode in complexity if not normalized early.
- Export correctness: CSV/PDF output must stay aligned with the calculation engine or users will lose trust.
- Tooling risk: adopting Bun too early could create compatibility friction with export libraries and future self-hosting needs.
- Product risk: the target workflow and buyer persona are still broad (makers, carpenters, small workshops, cloud users).

### Ready for Proposal
Yes — the next phase should create `proposal.md` for `openmodulewood-prd-foundation`, define the MVP boundary, and split the work into testable domains before any implementation starts.
