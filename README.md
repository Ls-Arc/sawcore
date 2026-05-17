# Sawcore

Sawcore is a Bun-first TypeScript monorepo for parametric cabinet design. It starts from a deterministic core engine that calculates parts from validated cabinet inputs, then exposes that result to preview, export, and a thin web flow.

## Quick path

1. Install dependencies:
   ```bash
   bun install
   ```
2. Verify the workspace:
   ```bash
   bun run typecheck
   bun run build
   bun test
   bun run ci:verify
   ```
3. Run the local stack:
   ```bash
   bun run local:up
   ```

Expected result: the web service starts through Docker Compose on port `3000` by default.

## What this project does

Sawcore is being built to help turn cabinet dimensions into a reliable, testable cut-list workflow.

Current v0.1 baseline includes:

- deterministic core-engine for cabinet part calculation
- workspace CRUD contracts and use-cases
- starter cabinet templates
- preview/export package wired from engine output
- thin web adapters
- local Docker Compose flow

## Tech stack

| Area | Choice |
|---|---|
| Language | TypeScript |
| Runtime / tooling | Bun |
| Repo shape | Monorepo |
| Architecture | Core engine + isolated packages |
| Local stack | Docker Compose |
| Planning flow | OpenSpec + SDD archive |

## Repository structure

```text
.
├── apps/
│   └── web/                  # thin web entrypoints, flow, HTTP server, tests
├── infra/
│   └── docker-compose.yml    # local v0.1 stack
├── openspec/
│   ├── specs/                # source-of-truth behavior specs
│   └── changes/archive/      # archived SDD changes
├── packages/
│   ├── core-engine/          # deterministic cabinet calculation
│   ├── domain/               # shared value objects and contracts
│   ├── preview-export/       # preview model + CSV/PDF facades
│   ├── template-starters/    # starter cabinet catalog
│   └── workspace-crud/       # workspace contracts and use-cases
├── package.json
└── tsconfig.json
```

## Architecture in one view

```text
workspace input
  -> domain normalization
  -> core-engine
  -> preview/export adapters
  -> web flow
```

Important rule: **preview and export consume engine output only**. They do not recalculate dimensions on their own.

## Available scripts

| Command | Purpose |
|---|---|
| `bun run typecheck` | Run TypeScript project checks |
| `bun run build` | Build the monorepo packages/apps |
| `bun test` | Run the full test suite |
| `bun run local:config` | Validate the Docker Compose config |
| `bun run ci:verify` | Run the required CI gate: typecheck, build, test, config |
| `bun run ci:smoke` | Run the manual Docker Compose smoke test |
| `bun run local:up` | Start the local stack |
| `bun run local:down` | Stop and clean the local stack |
| `bun run local:smoke` | Run local stack smoke tests |

## CI contract

Required CI covers install, typecheck, build, test, and Docker Compose config validation through `bun run ci:verify`.
Docker smoke stays manual for now through `bun run ci:smoke` so host flakiness does not block merges.

Before branch protection or required checks are enabled, reconcile local `main` with `origin/main` first. Treat the GitHub history as authoritative only after that baseline has been compared and brought back into alignment.

## Development workflow

1. Start from the specs in `openspec/specs/`.
2. Keep package boundaries clean.
3. Put business rules in `packages/core-engine`, not in `apps/web`.
4. Verify changes with Bun commands before asking for review.

## Project status

This repository already has an archived SDD foundation change:

- `openspec/changes/archive/2026-05-16-openmodulewood-prd-foundation/`

That archived change established the current baseline:

- Bun-first monorepo setup
- core engine foundation
- CRUD and starter templates
- preview/export integration
- local web runtime and Docker Compose verification

## Next steps

Likely next areas of work:

- richer cabinet rules
- more starter templates
- stronger CI around Docker smoke stability
- deeper export and production workflows

## Checklist

- [ ] `bun install` works locally
- [ ] `bun run typecheck` passes
- [ ] `bun run build` passes
- [ ] `bun test` passes
- [ ] `bun run local:up` starts the web service
