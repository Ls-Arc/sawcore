# ModuleWood Front

Frontend app for the Sawcore monorepo. It consumes the existing `apps/web` API using Bun-first tooling.

## Quick path

1. Install workspace dependencies from the repository root:

   ```bash
   bun install
   ```

2. Create the local env file for the frontend app:

   ```bash
   cp apps/front/.env.example apps/front/.env
   ```

3. Start the frontend dev server:

   ```bash
   bun run --cwd apps/front dev
   ```

Expected result: Vite serves the app locally and the frontend points to `VITE_API_URL`.

## Available scripts

| Command | Purpose |
|---|---|
| `bun run --cwd apps/front dev` | Start the frontend dev server |
| `bun run --cwd apps/front build` | Typecheck and build the frontend |
| `bun run --cwd apps/front preview` | Preview the production build |

## Notes

- This app is intentionally separate from `apps/web`, which remains the API/server.
- Server state should live in TanStack Query; local UI state belongs in Zustand.
- Keep API access centralized under `src/lib/api/` and feature-specific hooks under `src/features/`.
