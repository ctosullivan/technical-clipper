# Context — current resumption checkpoint

This file is a single current snapshot, not a log. Overwrite it at every
natural stopping point. History lives in git and `CHANGELOG.md` — see
`AGENTS.md` § "Roadmap and context".

## Active phase

Phase 6 — Structured adapters — status: **done**.
Next: Phase 7 (`planning/phase-7-rendering-and-capture-bundle.md`).

The user has authorised implementing the phase plans through to the MVP and
pushing each phase commit, stopping only for genuine blockers and for the
Phase 10 release-approval gate. Implementation proceeds in roadmap order, one
phase per commit.

## Last completed work

Phase 6: `@technical-clipper/adapters` — the ChatGPT current-branch
conversation adapter (`ConversationIR`, `decisions/0026`) and the ClipSpec
seam (`decisions/0018`). `code/docusaurus-tabs` detector (`decisions/0027`).
`capture()` restructured: ClipSpec resolution + effective config, the
conversation path, and a shared `finalize()`. 4 conversation + 3 docusaurus
fixtures with goldens; `tests/pipeline-adapters.test.ts`. CI green: 15 files /
118 tests.

## Unresolved decisions

None blocking. Phase 7 adds phase-local ADRs: sanitizer choice, ZIP-writer
choice, the `commonmark` degrade table. Phase 7 implements the IR→Markdown
renderer (three profiles, `decisions/0019`), canonical JSON file writers,
`manifest.json` (identity/event split), the deterministic ZIP writer, and
`raw/page.html` sanitization — all in `packages/core` (`render/`, `bundle/`).
The pipeline already produces validated `DocumentIR`s with hashes; Phase 7
consumes them.

## Verification state

`pnpm` not on PATH; use `npx --yes pnpm@9.12.0 <cmd>`.
`npx --yes pnpm@9.12.0 run ci` — green: `format:check` clean, `lint` 0 errors,
`tsc -b` passes, 15 test files / 118 tests pass, `skill:verify` PASS.
`node scripts/capture-fixture.mjs --all` — PASS (all goldens match,
deterministic).

## Working-tree state

Git repo on `master`, tracking `origin/master`
(<https://github.com/ctosullivan/technical-clipper.git>). Phases 0–5 pushed;
Phase 6 commit pending. Nothing tagged or released.

## Next concrete action

Begin **Phase 7** per `planning/phase-7-rendering-and-capture-bundle.md`:
implement `packages/core/src/render/` (IR→Markdown walker, three profile
configs + degrade table, `selectFence` integration + render-back
verification, obsidian frontmatter, HTML sanitizer) and
`packages/core/src/bundle/` (canonical JSON writers, `manifest.json` builder,
deterministic ZIP writer, `assembleBundle`). Add golden `expected.md` /
`expected-hashes.json` to the fixtures; `tests/render-*.test.ts` +
`tests/bundle-*.test.ts`. Replace the `docs/capture-format.md` stub. Commit
`feat(phase-7): …` and push.
