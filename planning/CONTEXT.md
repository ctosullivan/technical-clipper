# Context — current resumption checkpoint

This file is a single current snapshot, not a log. Overwrite it at every
natural stopping point. History lives in git and `CHANGELOG.md` — see
`AGENTS.md` § "Roadmap and context".

## Active phase

Phase 4 — DOM capture and standard article extraction — status: **done**.
Next: Phase 5 (`planning/phase-5-standard-code-extraction.md`).

The user has authorised implementing the phase plans through to the MVP and
pushing each phase commit, stopping only for genuine blockers and for the
Phase 10 release-approval gate. Implementation proceeds in roadmap order, one
phase per commit.

## Last completed work

Phase 4: new `@technical-clipper/pipeline` package — `capture()` runs
clone → detect + sentinel → noise removal → deterministic article-root
selection → DOM→`ArticleIR` → restore → assemble + `validateDocumentIR`,
inside a network trap. ADRs `0022` (linkedom), `0023` (in-house extractor +
scoring), `0024` (Wikipedia policy). 8 `fixtures/articles/*` with goldens,
`scripts/capture-fixture.mjs`, `tests/pipeline-article.test.ts`.
`decisions/0013` seam interfaces implemented here (DOM-typed) not in `core`.
`.prettierignore` now excludes `fixtures/`.

## Unresolved decisions

None blocking. Phase 5 adds phase-local ADR: the language-inference heuristic

- confidence thresholds. Phase 5 fills the `DetectorRegistry` with real
  detectors (`code/pre-code`, `code/blocklevel-code`, `code/prism`,
  `code/highlightjs`, `terminal/session`) that the Phase 4 seam already accepts;
  `capture()` needs no changes beyond wiring a default registry.

Known scope note: real revision-pinned Wikipedia fixtures (§ 12 ≥ 5 minimum)
are deferred to Phase 10 — WebFetch returns markdown, not raw HTML. Phase 4
used synthetic MediaWiki-structured fixtures (`origin: synthetic`).

## Verification state

`pnpm` not on PATH; use `npx --yes pnpm@9.12.0 <cmd>`.
`npx --yes pnpm@9.12.0 run ci` — green: `format:check` clean, `lint` 0 errors,
`tsc -b` passes, 13 test files / 85 tests pass, `skill:verify` PASS.
`node scripts/capture-fixture.mjs --all` — PASS (all goldens match,
deterministic).

## Working-tree state

Git repo on `master`, tracking `origin/master`
(<https://github.com/ctosullivan/technical-clipper.git>). Phases 0–3 pushed;
Phase 4 commit pending. Nothing tagged or released.

## Next concrete action

Begin **Phase 5** per `planning/phase-5-standard-code-extraction.md`:
implement `packages/detectors` — the fixed priority table, chrome-stripping
helpers, `code/pre-code`, `code/blocklevel-code`, `code/prism`,
`code/highlightjs`, `terminal/session`, language inference (+ ADR), wire a
default `DetectorRegistry` into `packages/pipeline`'s `capture()`, add
`fixtures/code/*` cases, and `tests/pipeline-code.test.ts`. Commit
`feat(phase-5): …` and push.
