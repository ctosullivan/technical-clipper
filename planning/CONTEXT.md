# Context — current resumption checkpoint

This file is a single current snapshot, not a log. Overwrite it at every
natural stopping point. History lives in git and `CHANGELOG.md` — see
`AGENTS.md` § "Roadmap and context".

## Active phase

Phase 9 — Chromium extension and Obsidian handoff — status: **done**.
Next: Phase 10 (`planning/phase-10-corpus-evaluation-security-review-mvp-release.md`).

The user has authorised implementing the phase plans through to the MVP and
pushing each phase commit. **Phase 10 stops for explicit release approval**
before any tag / `[Unreleased]` promotion / store submission (`AGENTS.md`
§ commit/release, § 16).

## Last completed work

Phase 9: `packages/extension` — the loadable Chromium MV3 dev extension.
Clip page action → inject `capture-in-page.js` (`activeTab` + `scripting`
only) → pipeline over the live DOM → results page (completeness report +
Markdown preview + Copy / Send-to-Obsidian (`decisions/0033`) / Download-bundle,
export-gated). esbuild bundler (`decisions/0032`); `packages/core` is now
`node:`-free (sync pure-JS SHA-256 in `sha256.ts`); `parseDocument` /
`captureFromHtml` moved to `pipeline/src/parse.js` so linkedom never enters a
browser bundle. CI green: 22 files / 160 tests.

## Unresolved decisions

None blocking. Phase 10 is corpus + gates + evaluation + security review +
packaging. Likely phase-local ADRs: only the reference-environment spec for
the timing gate (recorded in `docs/evaluation/`, ADR if contested).
Post-MVP roadmap rows/ADRs for anything the evaluation surfaces.

## Verification state

`pnpm` not on PATH; use `npx --yes pnpm@9.12.0 <cmd>`.
`npx --yes pnpm@9.12.0 run ci` — green: `format:check` clean, `lint` 0 errors,
`tsc -b` passes, 22 test files / 160 tests pass, `skill:verify` PASS.
`node scripts/capture-fixture.mjs --all` — PASS.
`pnpm --filter @technical-clipper/extension run build` — produces a loadable
`dist/` (verified browser-safe: no `node:` / linkedom).

## Working-tree state

Git repo on `master`, tracking `origin/master`
(<https://github.com/ctosullivan/technical-clipper.git>). Phases 0–8 pushed;
Phase 9 commit pending. Nothing tagged or released.

## Next concrete action

Begin **Phase 10** per
`planning/phase-10-corpus-evaluation-security-review-mvp-release.md`:
`scripts/fixture-lint.mjs` (corpus completeness + provenance validity),
`scripts/gates.mjs` (map every § 12 automatable gate to a threshold check),
fill the article corpus toward ≥ 20 (incl. real revision-pinned Wikipedia if
raw HTML can be obtained, else keep synthetic + record the gap), the code
corpus toward ≥ 50 blocks; `docs/evaluation/` (reference environment,
Obsidian vault check, comparative benchmark, security review); finalize docs;
assemble the MVP `CHANGELOG.md` entry under `[Unreleased]`. **Then stop and
request explicit approval to promote `[Unreleased]` and tag the MVP** — do
not tag, push a release, or submit to a store.
