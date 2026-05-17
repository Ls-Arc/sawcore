# Exploration: ci-foundation

### Current State
Sawcore already has a strong local verification surface: `bun run build`, `bun run typecheck`, `bun test`, Node-compatible fallbacks (`build:node`, `typecheck:node`, `test:node`, `verify:node`), and Docker Compose smoke coverage through `apps/web/test/docker-compose-smoke.test.ts`. The repo is also explicit that the next step is “stronger CI around Docker smoke stability”.

There is no connected remote repository yet, so anything GitHub-hosted would be planning-only for now. The current risk is not lack of checks — it is that the CI contract is not yet formalized into a proposal and there is no lockfile-backed install story visible in the repo.

### Affected Areas
- `package.json` — current local gates and the likely future CI command surface.
- `README.md` — documents the local workflow and explicitly calls out CI hardening as a next step.
- `infra/docker-compose.yml` — the local runtime contract that smoke tests exercise.
- `apps/web/test/docker-compose-smoke.test.ts` — the highest-risk check because it depends on Docker availability, port allocation, and cleanup discipline.
- `openspec/changes/ci-foundation/proposal.md` — next phase should turn this exploration into a concrete CI proposal.

### Approaches
1. **Local-first CI foundation only** — standardize install/typecheck/build/test/smoke commands now, but keep GitHub Actions out until a remote exists.
   - Pros: matches current state, avoids premature workflow churn, keeps the contract portable.
   - Cons: no hosted automation yet; manual enforcement still required.
   - Effort: Low

2. **Local foundation + placeholder GitHub Actions files** — define workflow files now, even if they cannot run yet.
   - Pros: makes the future integration mechanical and documents the intended pipeline.
   - Cons: files are inert without remote access, and they may drift before first use.
   - Effort: Low/Medium

3. **Full remote CI now** — add workflow, required checks, and branch protection assumptions immediately.
   - Pros: fastest path to real automation once a remote exists.
   - Cons: impossible to validate without a connected repository; risks overfitting to assumptions.
   - Effort: Medium

### Recommendation
Use a **local-first CI foundation** as the proposal target: define a single source of truth for install/typecheck/build/test/smoke checks now, and defer GitHub Actions file creation until the remote is connected. That keeps the next change small, verifiable, and independent of GitHub setup.

Minimum foundation for this repo now:
- `bun install` as the reproducible bootstrap step (but the proposal should also settle the lockfile policy, because CI cannot be truly deterministic without it).
- `bun run typecheck`
- `bun run build`
- `bun test`
- `bun run local:config`
- `bun run local:smoke` only as an optional/risky gate until Docker stability is improved.

Mandatory for proposal phase: make install + typecheck + build + unit/integration tests the hard gates; keep Docker smoke as a separate, explicitly labeled environment-dependent job until it proves stable enough for required status checks.

### Risks
- Docker smoke flakiness is real: the archived verification already noted transient Docker network/container conflicts and a startup timeout.
- No remote repository means GitHub Actions cannot be exercised end-to-end yet; workflow files would be speculative.
- There is no visible lockfile, so install reproducibility is still not fully pinned down.
- Docker-dependent checks can fail for host-environment reasons unrelated to code quality.

### Ready for Proposal
Yes — the proposal should define a local-first CI contract, decide the lockfile/install policy, and postpone GitHub Actions until the remote exists; then the next phase can add workflow files with confidence.
