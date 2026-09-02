# Phase 0 — Repository scaffolding and governance

## Status

done

## Goal and user-visible outcome

Produce a buildable, empty-behaviour TypeScript workspace with the process
documents, architecture baseline, and initial ADRs needed for every later
phase to be planned and built against a stable foundation. No product
capability (extraction, rendering, capture) is implemented in this phase.

## Scope covered

- Workspace tooling: package manager, TypeScript project references,
  linter, formatter, test runner, CI.
- Minimal package directories (`core`, `detectors`, `adapters`, `extension`)
  that compile and have one honest scaffold test each — no faked behaviour.
- Governance documents: `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`,
  `README.md`, `LICENSE`, `CHANGELOG.md`.
- `architecture/overview.md` (current state + target design).
- Initial ADRs (`decisions/0001`–`0010`) for the fixed architectural
  constraints and the Phase 0 toolchain selection.
- `docs/` stubs for capture format, extension reference, and privacy/
  security — clearly labelled not-yet-implemented where applicable.
- `ai-docs/README.md` and `ai-docs/AGENTS.md`.
- `planning/ROADMAP.md`, `planning/CONTEXT.md`.
- `planning/v0-to-mvp-planning-prompt.md` — durable, verified-identical copy
  of the source prompt.
- This file and `planning/phase-1-plan-mvp.md`.
- `fixtures/` and `tests/` skeleton directories with READMEs.

## Explicit deferrals / non-goals for this phase

- Any Phase 2–10 implementation-ready plan file (Phase 1's job).
- `planning/mvp-execution-plan.md` (Phase 1's job).
- Any actual IR type, detector, adapter, renderer, or extension capture
  behaviour.
- Installing feature-specific dependencies (Defuddle, a Markdown renderer,
  a ZIP library, etc.) — only generic workspace tooling is installed now.

## Dependencies and assumptions

- Target directory (`c:\Users\user\Dev\TypeScript\Web Clipper Plugin`) was
  verified empty and not a git repository before any file was written.
- Assumes pnpm and Node 20+ are available in the environment that runs
  verification; if `pnpm install` cannot reach the registry, that is
  recorded as-is in `planning/CONTEXT.md` rather than worked around.

## Design decisions already settled

See `decisions/0001`–`0010`. Toolchain specifics: pnpm workspaces, TypeScript
project references (no Nx/Turborepo yet), Vitest, ESLint (flat config) +
Prettier, Node 20 LTS, GitHub Actions CI running real checks only
(`decisions/0010`).

## Files added

Workspace root: `LICENSE`, `.gitignore`, `.editorconfig`, `.nvmrc`,
`package.json`, `pnpm-workspace.yaml`, `tsconfig.json`, `tsconfig.base.json`,
`eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `AGENTS.md`,
`CLAUDE.md`, `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`,
`.github/workflows/ci.yml`.

`packages/core`: `package.json`, `tsconfig.json`, `src/index.ts` (scaffold
exports), `src/index.test.ts`.

`packages/detectors`: same shape, depends on `core`.

`packages/adapters`: same shape, depends on `core`.

`packages/extension`: `package.json`, `tsconfig.json`, `manifest.json`
(Manifest V3, zero permissions), `src/background.ts`,
`src/manifest.test.ts` (real manifest validation).

`architecture/overview.md`; `decisions/0001`–`0010-*.md`;
`docs/capture-format.md`, `docs/cli-or-extension-reference.md`,
`docs/privacy-and-security.md`; `ai-docs/README.md`, `ai-docs/AGENTS.md`;
`planning/v0-to-mvp-planning-prompt.md`, `planning/ROADMAP.md`,
`planning/CONTEXT.md`, `planning/phase-0-repo-scaffolding.md` (this file),
`planning/phase-1-plan-mvp.md`; `fixtures/README.md` + four empty
subdirectories with `.gitkeep`; `tests/README.md`.

## Implementation sequence

1. Inspect target directory; confirm empty, not a git repo, no existing
   planning prompt copy.
2. Draft decision table, roadmap outline, Phase 0/1 plan summaries, ADR
   list, and full `AGENTS.md`/`CLAUDE.md` text; get explicit user approval
   before writing (per the source prompt's governance-file gate).
3. Write workspace tooling files.
4. Write governance files (`AGENTS.md`, `CLAUDE.md`, `README.md`,
   `CONTRIBUTING.md`, `CHANGELOG.md`, `LICENSE`).
5. Write CI workflow.
6. Write the four package scaffolds, each with a real (non-faked) test.
7. Write `architecture/overview.md`.
8. Write ADRs 0001–0010.
9. Write `docs/` stubs and `ai-docs/`.
10. Copy the source prompt verbatim to
    `planning/v0-to-mvp-planning-prompt.md`; diff against the source to
    confirm byte-identical.
11. Write `planning/ROADMAP.md`, this file, and `planning/phase-1-plan-mvp.md`.
12. Write `fixtures/` and `tests/` skeletons.
13. Run verification (`pnpm install`, `pnpm run ci`); inspect the file list.
14. Update this file's status, `CHANGELOG.md`, `ROADMAP.md`, and
    `planning/CONTEXT.md` with the verified result.
15. If authorized, `git init` and make the logical Phase 0 commit(s).

## Test fixtures and edge cases

No product fixtures — this phase has no extraction behaviour. The scaffold
tests themselves are the "edge case" being covered: each package's
placeholder entrypoint must _throw_ rather than silently return a fake
success, and the extension manifest test asserts the real, current manifest
content (MV3, zero permissions) rather than an aspirational one.

## Runnable verification and expected outcomes

```sh
pnpm install
pnpm format:check   # expect: no files need formatting
pnpm lint            # expect: no ESLint errors
pnpm typecheck        # expect: tsc -b succeeds across all 4 packages
pnpm build            # expect: dist/ output for core, detectors, adapters, extension
pnpm test             # expect: all scaffold + manifest tests pass; no test is a fake `assert true`
```

**Actual result:** all five commands ran clean —
`format:check` (all files Prettier-clean, with
`planning/v0-to-mvp-planning-prompt.md` explicitly excluded via
`.prettierignore` to preserve its byte-identical status),
`lint` (0 ESLint errors), `typecheck`/`build` (`tsc -b` succeeded across all
4 packages, `dist/` produced for each), `test` (4 test files, 9 tests, all
passed — `packages/core`, `packages/detectors`, `packages/adapters` scaffold
tests plus `packages/extension` manifest validation).

## Documentation / ADR / changelog effects

- `CHANGELOG.md` — `[Unreleased]` entry for Phase 0 (already added).
- `decisions/0001`–`0010` created as part of this phase.
- `architecture/overview.md` created as part of this phase.
- No pre-existing docs to update (fresh repository).

## Stop-and-ask conditions specific to this phase

- If `planning/v0-to-mvp-planning-prompt.md` already existed and differed
  from the supplied prompt — did not occur; directory was empty.
- If the target directory contained unrelated existing work — did not
  occur.
- Before writing `AGENTS.md`/`CLAUDE.md` — resolved via explicit user
  approval prior to any file being written.
- Before committing — resolved via explicit user authorization (commit
  yes, no push/tag without separate authorization).

## Completion evidence to record

- `pnpm format:check && pnpm lint && pnpm typecheck && pnpm build && pnpm test`
  all passed (recorded above and in `planning/CONTEXT.md`).
- `diff` against the supplied prompt confirmed
  `planning/v0-to-mvp-planning-prompt.md` is byte-identical (checked twice:
  immediately after copying, and again after running Prettier across the
  repository, since it is explicitly excluded from formatting).
- Full file list reviewed directly (see `planning/CONTEXT.md`); no
  unplanned files. `dist/` and `*.tsbuildinfo` build output exists on disk
  but is git-ignored, not committed.
- Commit `f845e78` — `feat(phase-0): scaffold repository and governance`
  (see `planning/CONTEXT.md`).
