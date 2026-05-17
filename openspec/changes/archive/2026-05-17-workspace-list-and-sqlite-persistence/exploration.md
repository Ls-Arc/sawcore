# Exploration: workspace-list-and-sqlite-persistence

### Current State
- `apps/web/src/flow.ts` builds a default in-memory repository (`Map`) when no repository is injected, so workspace data disappears when the process restarts.
- `apps/web/src/http.ts` exposes create/read/update/delete plus preview/export routes, but there is no `GET /api/workspaces` collection endpoint.
- `packages/workspace-crud/src/contracts.ts` only defines `create/read/update/delete`; the use-cases layer has no list operation, so the repo cannot enumerate persisted workspaces.
- `apps/front` can fetch a single workspace and navigate to `/workspaces/:id`, but it has no workspace list route/hook/UI yet.

### Affected Areas
- `packages/workspace-crud/src/contracts.ts` / `use-cases.ts` / `index.ts` — add repository listing and a list use case.
- `apps/web/src/flow.ts` — expose workspace listing from the HTTP-facing flow.
- `apps/web/src/http.ts` — add `GET /api/workspaces` and update the approved flow contract.
- `apps/web/src/server.ts` / repository wiring — select SQLite at startup and pass the concrete repo into the flow.
- `apps/web/src/memory-workspace-repository.ts` — keep only as test/injection fallback.
- `infra/docker-compose.yml` — persist the SQLite file on a stable mounted path/volume.
- `apps/front/src/*` — optional follow-up to consume the new list endpoint with a list page/hook.
- `packages/*/test/*` — add repository, flow, API, and restart-persistence coverage.

### Approaches
1. **SQLite as the default runtime backend** — store each workspace as a row (likely serialized JSON plus a small metadata column set), add `list()`, and boot the server with SQLite by default.
   - Pros: matches the user request directly; one persistence path; restart persistence becomes real immediately.
   - Cons: requires env/path decisions and test isolation discipline.
   - Effort: Medium

2. **Backend switch (`memory` vs `sqlite`) with SQLite as the default** — keep a small selector in app bootstrap for local/test overrides, but use SQLite in normal startup.
   - Pros: safer rollout; easier to keep fast tests and ad hoc dev flows.
   - Cons: more branching and more chance of hiding persistence bugs if the wrong mode is used.
   - Effort: Medium

3. **SQLite behind a feature flag, memory still default** — introduce SQLite without changing the current production boot path.
   - Pros: lowest immediate runtime risk.
   - Cons: does not satisfy the product intent; persistence/listing remain optional instead of current behavior.
   - Effort: Low/Medium

### Recommendation
Use **SQLite as the default backend now** and keep the memory repo only for tests or explicit override paths.

For the narrowest useful MVP, do this first:
1. Extend the repository contract with `list()` and add `GET /api/workspaces`.
2. Implement SQLite persistence in a single table that stores the full workspace payload and preserves ordering deterministically.
3. Wire server startup to a persistent db file path (not an ephemeral process store).
4. Add restart-oriented tests that prove create → restart → read/list/update/delete still work.

That slice gives a usable backend for list/retrieve/update/delete plus restart persistence without designing a full persistence framework.

### Risks
- Adding migrations too early can widen the blast radius; a one-table JSON payload is safer for the first cut.
- If the SQLite file path lives inside the source tree or temp space, restart persistence will look correct in one mode and disappear in another.
- SQLite is single-writer; concurrent writes from multiple requests need clear transaction boundaries.
- Test suites can leak state if they share the same db file; each test should use its own temporary path.
- The front app currently has no list screen, so the new endpoint may be invisible until a UI slice is added.

### Ready for Proposal
Yes — propose SQLite as the default runtime backend, add a list endpoint, and keep the first persistence schema deliberately minimal so proposal/design can focus on pathing, ordering, and isolation rather than migrations.
