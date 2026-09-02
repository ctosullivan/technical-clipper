# Context — current resumption checkpoint

This file is a single current snapshot, not a log. Overwrite it at every
natural stopping point. History lives in git and `CHANGELOG.md` — see
`AGENTS.md` § "Roadmap and context".

## Active phase

Phase 5 — Standard code extraction — status: **done**.
Next: Phase 6 (`planning/phase-6-structured-adapters.md`).

The user has authorised implementing the phase plans through to the MVP and
pushing each phase commit, stopping only for genuine blockers and for the
Phase 10 release-approval gate. Implementation proceeds in roadmap order, one
phase per commit.

## Last completed work

Phase 5: `@technical-clipper/detectors` — `code/pre-code`,
`code/blocklevel-code`, `code/prism`, `code/highlightjs`, `terminal/session`,
and a virtualized-editor guard, with chrome stripping and language inference
(`decisions/0025`). Seam contracts moved to `packages/core/src/seam.ts`;
`pipeline` now depends on `detectors` and `capture()` uses
`standardDetectorRegistry()` by default. 13 `fixtures/code/*` fixtures with
goldens; `tests/pipeline-code.test.ts`. CI green: 14 files / 103 tests.

## Unresolved decisions

None blocking. Phase 6 adds phase-local ADRs: ChatGPT branch/role evidence
rules, and Docusaurus grouping rules. Phase 6 fills `packages/adapters`
(currently a scaffold) and wires an `AdapterRegistry` into `capture()`,
adding the `conversation` capture path (`ConversationIR`) and the ClipSpec
resolver. The `AdapterRegistry` seam already exists in `core`; `capture()`
currently only produces `ArticleDocumentIR`.

## Verification state

`pnpm` not on PATH; use `npx --yes pnpm@9.12.0 <cmd>`.
`npx --yes pnpm@9.12.0 run ci` — green: `format:check` clean, `lint` 0 errors,
`tsc -b` passes, 14 test files / 103 tests pass, `skill:verify` PASS.
`node scripts/capture-fixture.mjs --all` — PASS (all goldens match,
deterministic).

## Working-tree state

Git repo on `master`, tracking `origin/master`
(<https://github.com/ctosullivan/technical-clipper.git>). Phases 0–4 pushed;
Phase 5 commit pending. Nothing tagged or released.

## Next concrete action

Begin **Phase 6** per `planning/phase-6-structured-adapters.md`: implement
`packages/adapters` — the Docusaurus tab-group adapter (`CodeGroupIR`), the
ChatGPT current-branch conversation adapter (`ConversationIR`, branch/role
evidence, streaming = fatal), and the ClipSpec resolver + precedence merge
(`decisions/0018`). Wire an `AdapterRegistry` into `capture()` and add the
`conversation` branch to the orchestrator. Add `fixtures/conversations/*` and
`fixtures/code/docusaurus-*`, `tests/pipeline-adapters.test.ts`. Commit
`feat(phase-6): …` and push.
