# Design: starter-cabinet-expansion

## Technical Approach

Keep the change **carcass-only**. The starter catalog will stay capped at two templates by swapping `tall-pantry` for a wall-cabinet starter, while preserving `compact-base` as the companion preset. No new cabinet-family types, drawer semantics, or door/front model are introduced; the starter remains a `CabinetSetup` plus the current default construction profile.

The wall-cabinet starter is just a shallow rectangular carcass that the existing engine can already calculate and preview/export. Recommended shape: `80cm × 72cm × 35cm`, `18mm` material thickness, `2mm` cut allowance, default overlay back panel.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Starter replacement | Replace `tall-pantry` with `wall-cabinet`; keep `compact-base` | Add a third template; rename base starter set | The spec already requires exactly two starters. Swapping preserves the cap and avoids catalog drift. |
| Cabinet model | Plain `CabinetSetup` only | Add wall/door/drawer family types | The current engine only understands a rectangular carcass with finite construction rules. New first-class families would spill into core-engine and validation. |
| Validation strategy | Reuse engine-driven validation and current flow boundaries | Add starter-specific preview/export logic | Preview/export already consume engine output only. Keeping that contract prevents duplicated rules and preserves determinism. |

## Data Flow

`listStarterTemplates()` → user selects starter → `seedWorkspaceFromTemplate()` → `createWorkspace()` / CRUD → `calculateParts()` → `buildPreviewModel()` / CSV / PDF

```text
template-starters ──→ workspace-crud ──→ core-engine ──→ preview-export
        │                   │                │               │
        └── approved set ───┴── seeded workspace ────────────┘
```

The web flow and HTTP adapter do not need new behavior; they already route template listing, seeded workspace creation, preview, and export through these packages.

## File Changes

| File | Action | Description |
|---|---|---|
| `openspec/changes/starter-cabinet-expansion/design.md` | Create | This design artifact. |
| `packages/template-starters/src/catalog.ts` | Modify | Swap `tall-pantry` for the wall-cabinet starter and keep cloning semantics. |
| `packages/template-starters/test/catalog.integration.test.ts` | Modify | Assert the exact two-template catalog and wall-cabinet seeding behavior. |
| `packages/workspace-crud/test/workspace-crud.integration.test.ts` | Modify | Seed and round-trip the wall-cabinet starter through CRUD. |
| `packages/preview-export/test/preview-export.integration.test.ts` | Modify | Prove starter-seeded workspaces still preview/export from engine output only. |
| `apps/web/test/web-flow.integration.test.ts` | Modify | Cover the new starter choice through the web flow wiring. |

## Interfaces / Contracts

No new public interfaces are required. Existing contracts stay in place:

- `StarterTemplate` and `seedWorkspaceFromTemplate()` still describe data-only starter presets.
- `Workspace` still carries a full `cabinetSetup`.
- `PreviewModel` and export artifacts still consume `CalculatePartsResult` only.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Starter catalog contents and cloning | Verify exactly two ids, wall-cabinet shape, and immutability. |
| Integration | Starter-seeded workspace CRUD | Seed from wall-cabinet, create/read/update/delete, and preserve construction profile. |
| Integration | Preview/export remain engine-derived | Calculate from seeded workspace, compare preview/CSV/PDF to engine output. |
| Web flow | End-to-end wiring | Confirm the API/flow still lists templates and serves seeded workspaces. |

## Migration / Rollout

No migration required. This is a catalog swap plus test coverage update; existing workspaces continue to load unchanged.

## Open Questions

- None.
