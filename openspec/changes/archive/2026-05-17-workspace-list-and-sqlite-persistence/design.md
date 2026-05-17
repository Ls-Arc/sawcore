# Design: workspace-list-and-sqlite-persistence

## Technical Approach

Make SQLite the default runtime repository for `apps/web`, while keeping the workspace use-case layer storage-agnostic. The CRUD package gains `list()`, the web flow exposes `listWorkspaces()`, and HTTP adds `GET /api/workspaces` to return the persisted collection. The database file lives at a stable path (`MODULEWOOD_SQLITE_PATH`, default `./.data/modulewood.sqlite`) so restart persistence is real instead of accidental.

## Architecture Decisions

| Decision | Options | Choice | Rationale |
|---|---|---|---|
| Workspace storage shape | Many columns vs JSON payload | One table with `payload` JSON + `created_at_ms` | Smallest schema that round-trips the full workspace without premature normalization. |
| Collection ordering | rowid, name, or timestamp | `created_at_ms ASC, id ASC` | Stable across restarts and deterministic even when timestamps collide. |
| Runtime default | Memory fallback vs SQLite default | SQLite default, memory only for tests/explicit override | Matches the MVP intent: persistence is the normal path, not an opt-in. |
| Schema evolution | ORM/migration framework vs bootstrap DDL | `CREATE TABLE IF NOT EXISTS` + optional `PRAGMA user_version` | Keeps v1 simple; one table does not justify a heavier migration system. |

## Data Flow

```text
HTTP POST/GET ──→ web flow ──→ workspace use-cases ──→ SQLite repo ──→ file on disk
                          ▲                               │
                          └──────────── restart ──────────┘
```

Create/update/delete stay on the existing single-workspace path. `list()` selects all rows in deterministic order, deserializes each payload, and returns the full `Workspace[]` collection to HTTP. After process restart, the same file is reopened and the same ordered list is returned.

## File Changes

| File | Action | Description |
|---|---|---|
| `packages/workspace-crud/src/contracts.ts` | Modify | Add `list(): Promise<Workspace[]>` to the repository contract. |
| `packages/workspace-crud/src/use-cases.ts` | Modify | Add a list use-case that clones returned workspaces. |
| `packages/workspace-crud/src/index.ts` | Modify | Export the new list use-case. |
| `apps/web/src/flow.ts` | Modify | Add `listWorkspaces()` and wire it to the repository. |
| `apps/web/src/http.ts` | Modify | Add `GET /api/workspaces` and include it in `APPROVED_FLOW`. |
| `apps/web/src/server.ts` | Modify | Boot with SQLite by default using the stable db path. |
| `apps/web/src/sqlite-workspace-repository.ts` | Create | SQLite repository adapter; stores JSON payload plus ordering metadata. |
| `infra/docker-compose.yml` | Modify | Mount `.data/` so local data survives container restarts. |
| `apps/web/test/*` | Modify/Add | Cover repo ordering, HTTP collection route, and restart persistence. |

## Interfaces / Contracts

```ts
export interface WorkspaceRepository {
  create(workspace: Workspace): Promise<Workspace>;
  read(workspaceId: string): Promise<Workspace | null>;
  update(workspace: Workspace): Promise<Workspace | null>;
  delete(workspaceId: string): Promise<boolean>;
  list(): Promise<Workspace[]>;
}
```

HTTP keeps the existing response envelope; `GET /api/workspaces` returns `200` with `data: Workspace[]` and `[]` when empty.

Front impact: no new screen is required in this slice, but the API contract now supports a future resume/list surface (`getWorkspaces` + query hook + list page) without changing backend shape again.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Repo create/read/update/delete/list behavior | Temp SQLite file per test; assert stable ordering and round-trip payloads. |
| Integration | Web flow + HTTP list endpoint | Create workspaces, call `GET /api/workspaces`, verify array and order. |
| E2E / smoke | Restart persistence | Docker Compose start → create workspace → restart → list/read still succeed. |

## Migration / Rollout

No migration required. First boot creates the database file and table automatically. The memory repository remains available only for tests or explicit overrides.

## Open Questions

- None.
