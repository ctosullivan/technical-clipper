# Context — current resumption checkpoint

This file is a single current snapshot, not a log. Overwrite it at every
natural stopping point. History lives in git and `CHANGELOG.md` — see
`AGENTS.md` § "Roadmap and context".

## Active phase

Phase 0 — Repository scaffolding and governance — status: **done**.

## Last completed work

All Phase 0 files written and verified: workspace tooling, governance docs
(`AGENTS.md`, `CLAUDE.md`, approved by the user before writing), four
package scaffolds (`core`, `detectors`, `adapters`, `extension`) each with a
real scaffold test, `architecture/overview.md`, ADRs `decisions/0001`–`0010`,
`docs/` stubs, `ai-docs/`, `planning/v0-to-mvp-planning-prompt.md` (confirmed
byte-identical to the supplied prompt, both immediately after copying and
again after running Prettier repo-wide), `planning/ROADMAP.md`,
`planning/phase-0-repo-scaffolding.md`, `planning/phase-1-plan-mvp.md`,
`fixtures/` and `tests/` skeletons. Repository initialized as a git repo and
the Phase 0 commit made (see hash below).

## Unresolved decisions

None blocking. Phase 1 will settle the cross-phase architecture decisions
the source prompt explicitly defers (typed IR contracts, detector/adapter
precedence, capture bundle contract specifics, fixture-strategy detail).

## Verification state

All green, run from a clean `pnpm install` (via `npx pnpm@9.12.0`, since
`pnpm` is not on PATH and `corepack enable`/`corepack pnpm` both failed in
this environment — noted below, not a blocker):

- `format:check` — pass (all files Prettier-clean;
  `planning/v0-to-mvp-planning-prompt.md` is excluded via `.prettierignore`
  to keep it byte-identical to the source prompt).
- `lint` — pass, 0 ESLint errors.
- `typecheck` / `build` (`tsc -b`) — pass across all 4 packages; `dist/`
  produced for each (git-ignored, not committed).
- `test` — pass: 4 test files, 9 tests (core/detectors/adapters scaffold
  tests + extension manifest validation).

**Environment note:** `pnpm` is not installed globally and `corepack
enable`/`corepack pnpm` both failed in this shell (EPERM on
`C:\Program Files\nodejs\pnpm`, then a corepack signature-verification
error). `npx --yes pnpm@9.12.0 <cmd>` works reliably and is what was used
for every command above. A future session without this constraint can just
use `pnpm <cmd>` directly once `pnpm` is available on PATH.

## Working-tree state

Git repository initialized; Phase 0 committed on `main`.
Commit: see `git log -1` — one logical commit,
`feat(phase-0): scaffold repository and governance`. Nothing pushed,
tagged, or released (not authorized, and not requested).

## Next concrete action

Begin **Phase 1** (planning-only) per `planning/phase-1-plan-mvp.md`:
produce implementation-ready plans for Phases 2 through 10, plus
`planning/mvp-execution-plan.md`, refine `planning/ROADMAP.md`, and add any
cross-phase ADRs the plans require. No product code until Phase 1's plans
exist and are reviewed.
