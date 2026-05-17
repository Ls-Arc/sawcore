# Design: real-world-validation-pack

## Technical Approach

Add one shared, validation-only fixture package for the four frozen cases and have every test layer consume it. The package will hold real cabinet inputs plus expected stable invariants for: compact/base, wall cabinet, inset-back variant, and the starter-seeded material-selected journey.

The runtime stack stays unchanged. Tests in `packages/core-engine`, `packages/preview-export`, `packages/workspace-crud`, and `apps/web` will import the same fixtures so we validate the same cabinet story end to end instead of maintaining per-package copies.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Fixture home | `packages/validation-fixtures/src/real-world-validation-pack.ts` | Copy fixtures into each test folder; store them under `openspec/` only | One source of truth is easier to review and prevents drift across engine, CRUD, preview/export, and API tests. |
| Package shape | Small workspace package with typed exports | Raw JSON files; ad hoc test helpers | TypeScript exports let tests share builders and expected invariants without runtime parsing or duplication. |
| Assertion style | Stable invariants, not full snapshots | Byte-for-byte CSV/PDF and whole-object snapshots | The pack should survive harmless formatting and ordering changes while still proving the current stack works. |

## Data Flow

`validation-fixtures` → engine input / workspace seed → CRUD round-trip → preview/export → web flow / HTTP

    fixtures
       │
       ├──→ core-engine tests
       ├──→ workspace CRUD tests
       ├──→ preview/export tests
       └──→ apps/web flow + HTTP tests

## Stable Invariants vs Brittle Snapshots

**Assert stable:**
- case id, template id, selected material id
- `workspaceId`, `units`, `allowancesApplied`
- part ids, counts, and key dimensions for named parts
- preview `state`, canvas bounds, part count, cost-summary presence when material is selected
- CSV/PDF contain the same workspace/material/part facts

**Avoid brittle coupling:**
- full CSV line ordering if it is not semantically relevant
- exact PDF bytes or text layout
- incidental JSON property order
- implementation-detail fields not used by consumers

## File Changes

| File | Action | Description |
|---|---|---|
| `packages/validation-fixtures/package.json` | Create | Private workspace package for shared validation data. |
| `packages/validation-fixtures/src/index.ts` | Create | Re-export the real-world pack and typed helpers. |
| `packages/validation-fixtures/src/real-world-validation-pack.ts` | Create | Four frozen cases and their expected stable invariants. |
| `tsconfig.json` | Modify | Add `@modulewood/validation-fixtures` path and project reference. |
| `packages/core-engine/test/calculate-parts.test.ts` | Modify | Consume frozen engine cases instead of local literals. |
| `packages/preview-export/test/preview-export.integration.test.ts` | Modify | Reuse the shared compact/base and journey fixtures. |
| `packages/workspace-crud/test/workspace-crud.integration.test.ts` | Modify | Use the shared starter-seeded workspace fixture. |
| `apps/web/test/web-flow.integration.test.ts` | Modify | Validate the starter/material journey with shared fixtures. |
| `apps/web/test/http.integration.test.ts` | Create | Exercise the same frozen journey through HTTP routes. |

## Interfaces / Contracts

```ts
export interface RealWorldValidationCase {
  readonly id: string;
  readonly workspaceId: string;
  readonly templateId?: "compact-base" | "wall-cabinet";
  readonly selectedMaterialId?: string;
  readonly cabinetSetup: CabinetSetup;
}
```

The package should also export expected-part assertions and the starter-seeded journey object so tests can compare only contract-level fields.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Engine determinism for the three cabinet cases | Exact part invariants from shared fixtures. |
| Integration | CRUD, preview/export, and web flow alignment | Same fixture package drives all packages. |
| E2E/API | HTTP endpoints for the starter journey | Assert status codes and stable payload facts, not serialized snapshots. |

## Migration / Rollout

No migration required.

## Open Questions

- [ ] None.
