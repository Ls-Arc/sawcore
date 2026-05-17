# Design: openmodulewood-prd-foundation

## Technical Approach

Implement v0.1 as a TypeScript monorepo with a deterministic core engine at the center and thin adapters around it. The repo is currently planning-only, so this design defines the first real package boundaries and keeps every outer layer dependent on typed contracts, not shared implementation.

Bun is acceptable as the user’s package manager / TS runner preference, but the design stays Node-compatible: package scripts, test runners, PDF tooling, and local deployment must work in the Node ecosystem first. That keeps exporters and verification stable while leaving room to adopt Bun more deeply later.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Core boundary | `packages/core-engine` owns deterministic calculation logic | Put logic in UI or exporter packages | The calculation engine must be reusable, testable, and the single source of truth for parts, units, and allowances. |
| Domain model | Shared value objects in `packages/domain` | Duplicate types per package | Shared types prevent drift across CRUD, preview, and export paths. |
| Tooling | Node-compatible package/test execution, Bun optional at the edge | Bun-only runtime/tooling | Node compatibility reduces exporter and CI risk; Bun can still speed local workflow. |
| Export flow | Exporters consume engine output, never recompute | Let CSV/PDF derive from workspace state directly | This prevents preview/export mismatches and keeps outputs deterministic. |

## Data Flow

Workspace CRUD → domain model → core engine → preview model / export adapters

```text
UI/API
  ↓
workspace-crud
  ↓
domain (units, dimensions, allowances, template instances)
  ↓
core-engine (deterministic part breakdown)
  ├──→ preview-export/preview model
  └──→ preview-export/csv + pdf exporters
  ↓
local-deployment (Docker Compose runs app + supporting services)
```

## File Changes

| File | Action | Description |
|---|---|---|
| `packages/domain/src/*` | Create | Value objects, unit normalization, workspace/cabinet types. |
| `packages/core-engine/src/*` | Create | Pure calculation engine and validation entrypoints. |
| `packages/workspace-crud/src/*` | Create | Workspace repository/service contracts and use cases. |
| `packages/template-starters/src/*` | Create | Small starter template catalog and seeding helpers. |
| `packages/preview-export/src/*` | Create | 2D preview model builder plus CSV/PDF exporter facades. |
| `apps/web/src/*` | Create | Thin UI shell calling package-level contracts. |
| `infra/docker-compose.yml` | Create | Local v0.1 runtime definition. |
| `package.json`, `tsconfig.json`, `pnpm-lock.yaml`/`bun.lockb` | Create | Workspace scripts and TypeScript project references. |

## Interfaces / Contracts

```ts
export type Unit = 'mm' | 'cm' | 'in';

export interface DimensionInput {
  value: number;
  unit: Unit;
}

export interface CalculatePartsInput {
  workspaceId: string;
  cabinet: CabinetSetup;
}

export interface CalculatePartsResult {
  parts: PartLine[];
  allowancesApplied: boolean;
  units: Unit;
}
```

The core engine MUST be pure: same input, same output. CRUD services MAY be stateful, but they only persist/resolve inputs for the engine.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Units, allowances, deterministic part math | Node-compatible Vitest/Node test suites against pure functions. |
| Integration | Workspace CRUD → engine → export contract | Package-level tests with fixture workspaces and golden outputs. |
| E2E | v0.1 local flow and preview/export smoke | Browser smoke tests plus Docker Compose startup checks. |

## Migration / Rollout

No migration required. This is a greenfield foundation; rollout is staged by package. First land the domain and core engine, then CRUD/templates, then preview/export, then local deployment.

## Open Questions

- [ ] Which PDF library best fits the Node-compatible exporter constraint once rendering is proven.
- [ ] Whether preview rendering should use SVG-first or canvas-first output in v0.1.
