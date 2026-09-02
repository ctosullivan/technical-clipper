# Context — current resumption checkpoint

This file is a single current snapshot, not a log. Overwrite it at every
natural stopping point. History lives in git and `CHANGELOG.md` — see
`AGENTS.md` § "Roadmap and context".

## Active phase

Phase 2 — Markdown-clipping Claude skill — status: **done**.
Next: Phase 3 (`planning/phase-3-core-ir-provenance-normalization-hashing.md`).

The user has authorised implementing the phase plans through to the MVP and
pushing each phase commit, stopping only for genuine blockers and for the
Phase 10 release-approval gate. Implementation proceeds in roadmap order, one
phase per commit.

## Last completed work

Phase 2: `.claude/skills/markdown-clipping/` — `SKILL.md`, five `references/*`
notes (CommonMark 0.31.2, GFM 0.29-gfm, Obsidian Help @2026-09-03), the
17-entry anti-pattern catalogue, `source-register.md` with derived-note
SHA-256s, `scripts/verify-examples.mjs` (dependency-free, offline),
`discovery-check.md`. `decisions/0021` (verifier uses no parser).
`skill:verify` wired into `pnpm run ci` + CI workflow; CI push branch fixed
`main`→`master`; `eslint.config.js` Node-globals block for `.mjs`.
Docs synced (`CLAUDE.md`, `README.md`, `architecture/overview.md`,
`CHANGELOG.md`).

## Unresolved decisions

None blocking. Phase 3 implements ADRs 0011–0016 (IR types, provenance,
diagnostics, canonical JSON, normalization, ids, hashing, fence selection).
Phase 3's `packages/core/src/fence.ts` must match
`.claude/skills/markdown-clipping/scripts/verify-examples.mjs` `selectFence`
for the shared cases (`decisions/0021` — a Phase 3 test should lock this).

## Verification state

`pnpm` not on PATH; use `npx --yes pnpm@9.12.0 <cmd>`.
`npx --yes pnpm@9.12.0 run ci` — green: `format:check` clean, `lint` 0 errors,
`tsc -b` passes, 4 test files / 9 tests pass, `skill:verify` PASS (0 failures).

## Working-tree state

Git repo on `master`, tracking `origin/master`
(<https://github.com/ctosullivan/technical-clipper.git>). Phase 1 pushed
(`b367100`, `5a47f69`). Phase 2 commit pending. Nothing tagged or released.

## Next concrete action

Begin **Phase 3** per
`planning/phase-3-core-ir-provenance-normalization-hashing.md`: implement the
typed IR family, provenance/confidence, diagnostics registry + export-status
derivation, canonical serialization, normalization rulesets, node ids,
hashing, fence selection, and `validateDocumentIR`, all as pure functions in
`packages/core` with deterministic unit tests. No DOM, detectors, adapters,
renderer, or bundle. Commit `feat(phase-3): …` and push.
