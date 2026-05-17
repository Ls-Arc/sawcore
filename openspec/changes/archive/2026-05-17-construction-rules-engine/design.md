# Design: construction-rules-engine

## Technical Approach

Model construction as a small typed profile attached to `CabinetSetup`, not a DSL. The engine stays the only place that interprets those rules: it normalizes mm inputs, applies defaults, validates enum values, then derives parts deterministically.

The profile is intentionally narrow:

```ts
export type BackPanelFit = "overlay" | "inset";

export interface ConstructionRules {
  readonly backPanelFit?: BackPanelFit;
  readonly allowances?: {
    readonly cut?: DimensionInput;
    readonly backInset?: DimensionInput;
  };
}
```

Default profile: `backPanelFit: "overlay"`, `allowances.cut: 2mm`.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Profile shape | Finite typed object with enums and mm fields | DSL, rule graph, free-form JSON | Keeps behavior testable and avoids premature generalization |
| Defaulting | Shared default profile in domain, applied by engine normalization | Template-only defaults, per-UI defaults | One contract for CRUD, templates, and calculation |
| Source of truth | `core-engine` resolves all carcass geometry | Preview/export recalculating geometry | Prevents drift between calculation and presentation |
| Back panel behavior | `backPanelFit` switches between two explicit geometric branches | Expression rules per cabinet family | Gives configurability without adding a parser |

## Data Flow

`web/API → workspace-crud → domain CabinetSetup(+rules) → core-engine normalize + validate → calculateParts → preview-export`

When `backPanelFit` is `overlay`, the back panel is sized from the outer carcass envelope using the shared allowance inputs. When it is `inset`, the back panel resolver subtracts the configured inset/gap inputs from the carcass opening. No string evaluation or rule composition is introduced; the branch is a plain enum switch inside `calculate-parts.ts`.

`preview-export` does not interpret construction rules directly; it stays a pure consumer of engine output so CSV/PDF/preview semantics cannot drift from calculation.

## File Changes

| File | Action | Description |
|---|---|---|
| `packages/domain/src/construction-rules.ts` | Create | New typed profile, enums, and shared defaults |
| `packages/domain/src/cabinet-setup.ts` | Modify | Add optional `constructionRules` to the workspace cabinet setup |
| `packages/domain/src/index.ts` | Modify | Re-export new construction rule types/defaults |
| `packages/core-engine/src/normalize-units.ts` | Modify | Normalize construction-rule mm inputs and apply defaults |
| `packages/core-engine/src/validation.ts` | Modify | Reject unknown fit values and unsupported rule payloads |
| `packages/core-engine/src/calculate-parts.ts` | Modify | Branch carcass/back-panel math on `backPanelFit` |
| `packages/template-starters/src/catalog.ts` | Modify | Seed starter templates with the default profile |
| `packages/workspace-crud/src/contracts.ts` | Modify | Preserve expanded cabinet setup shape in create/update |
| `apps/web/src/flow.ts` | Modify | Pass the profile through create/read/update/preview/export flows |

## Interfaces / Contracts

```ts
export interface CabinetSetup {
  width: DimensionInput;
  height: DimensionInput;
  depth: DimensionInput;
  materialThickness: DimensionInput;
  allowances?: { cut?: DimensionInput };
  constructionRules?: ConstructionRules;
}
```

`calculateParts()` still returns the same `PartLine[]`; the only change is how the back panel dimensions are derived.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Defaults, validation, overlay/inset branching | Matrix tests on `calculateParts` and normalization helpers |
| Integration | Workspace/template round-trip | Seed, create, update, and read workspaces with/without rules |
| E2E | Web preview/export remain engine-driven | Create workspace from template, preview it, export CSV/PDF, verify identical engine output |

## Migration / Rollout

No migration required. Missing `constructionRules` values default in normalization, so existing workspaces remain valid.

## Open Questions

- None.
