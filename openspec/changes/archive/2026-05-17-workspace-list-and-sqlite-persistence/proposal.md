# Proposal: workspace-list-and-sqlite-persistence

## Intent

Make workspace data survive process restarts by making SQLite the default runtime backend, and expose a collection endpoint so callers can list persisted workspaces. This is the smallest useful persistence slice: real storage plus discoverability, not a generic storage framework.

## Scope

### In Scope
- SQLite-backed workspace persistence as the default startup path.
- `GET /api/workspaces` for listing persisted workspaces.
- Minimal repository/use-case updates to support `list()` and deterministic ordering.

### Out of Scope
- Generic backend selection UI or pluggable storage architecture.
- Broad migrations, multi-table schema design, or ORM adoption.
- Frontend list screen work beyond API enablement.

## Capabilities

### New Capabilities
- `workspace-list`: enumerate persisted workspaces through the flow/API.

### Modified Capabilities
- `workspace-crud`: repository contract and use-cases gain list support; persistence must round-trip through SQLite.
- `local-deployment`: runtime startup must use a stable SQLite file path/volume instead of ephemeral memory.

## Approach

Use one SQLite table that stores the full workspace payload with only the metadata needed for stable reads/lists. Keep the memory repository as an explicit test/injection fallback, but do not use it for normal server startup. The web API exposes the new collection route and the server boots with SQLite by default.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/workspace-crud/src/*` | Modified | Add repository listing and list use case. |
| `apps/web/src/flow.ts` | Modified | Expose workspace listing from the HTTP flow. |
| `apps/web/src/http.ts` | Modified | Add `GET /api/workspaces` and update the approved flow contract. |
| `apps/web/src/server.ts` / repo wiring | Modified | Boot with SQLite by default and pass the concrete repo into the flow. |
| `infra/docker-compose.yml` | Modified | Mount a stable SQLite file location for local persistence. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| SQLite file path is ephemeral and hides restart bugs | Med | Use a stable mounted path/volume and test restart behavior. |
| Minimal schema grows into premature migration complexity | Med | Store the full workspace payload in one table first. |
| Shared test database leaks state between cases | Med | Isolate each test with its own temporary db path. |

## Rollback Plan

Revert server wiring to the memory repository, remove the list route, and drop the SQLite file/volume wiring. Because the schema is intentionally minimal, rollback should not require data migration.

## Dependencies

- Existing workspace CRUD contracts and HTTP flow.
- A stable local filesystem path for the SQLite database file.

## Success Criteria

- [ ] A workspace created through the current API survives a server restart.
- [ ] `GET /api/workspaces` returns persisted workspaces in deterministic order.
- [ ] Normal runtime startup uses SQLite by default; memory remains test-only or explicit override.
