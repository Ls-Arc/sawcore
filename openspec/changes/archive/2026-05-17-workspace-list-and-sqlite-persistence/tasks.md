# Tasks: workspace-list-and-sqlite-persistence

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 450-650 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|---|---|---|---|
| 1 | SQLite repo + default runtime wiring | PR 1 | `packages/workspace-crud/*`, `apps/web/src/sqlite-workspace-repository.ts`, `apps/web/src/server.ts`, `infra/docker-compose.yml` |
| 2 | List API + coverage | PR 2 | `apps/web/src/flow.ts`, `apps/web/src/http.ts`, `apps/web/test/*`, restart/list isolation cases |

## Phase 1: Contract & use-case foundation

- [x] 1.1 Add `list(): Promise<Workspace[]>` to `packages/workspace-crud/src/contracts.ts` and export the new use case from `packages/workspace-crud/src/index.ts`.
- [x] 1.2 Implement `listWorkspaces(repository)` in `packages/workspace-crud/src/use-cases.ts` to clone returned items and keep the layer storage-agnostic.

## Phase 2: SQLite persistence + runtime default

- [x] 2.1 Create `apps/web/src/sqlite-workspace-repository.ts` with `create/read/update/delete/list`, JSON payload storage, and deterministic order by `created_at_ms ASC, id ASC`.
- [x] 2.2 Boot `apps/web/src/server.ts` with SQLite by default, resolving `MODULEWOOD_SQLITE_PATH` to `./.data/modulewood.sqlite` when unset.
- [x] 2.3 Update `infra/docker-compose.yml` to mount `.data/` (or equivalent volume) so local workspace data survives container restarts.

## Phase 3: HTTP/flow wiring

- [x] 3.1 Extend `apps/web/src/flow.ts` with `listWorkspaces()` backed by the configured repository.
- [x] 3.2 Add `GET /api/workspaces` to `apps/web/src/http.ts`, include it in `APPROVED_FLOW`, and keep `/api/workspaces/:id` routing unambiguous.

## Phase 4: Verification

- [x] 4.1 Add repository tests for list ordering, round-trip persistence, and per-test temp SQLite isolation.
- [x] 4.2 Add HTTP/web-flow tests that create workspaces, call `GET /api/workspaces`, and assert the returned array/order.
- [x] 4.3 Add restart-persistence smoke coverage using a unique SQLite path per test run so state does not leak across cases.

## Phase 5: Cleanup

 - [x] 5.1 Update any exports/comments that still imply memory is the default runtime repository.
