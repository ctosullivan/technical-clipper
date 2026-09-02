# Context — current resumption checkpoint

This file is a single current snapshot, not a log. Overwrite it at every
natural stopping point. History lives in git and `CHANGELOG.md` — see
`AGENTS.md` § "Roadmap and context".

## Active phase

Phase 3 — Core IR, provenance, normalization, hashing — status: **done**.
Next: Phase 4 (`planning/phase-4-dom-capture-and-article-extraction.md`).

The user has authorised implementing the phase plans through to the MVP and
pushing each phase commit, stopping only for genuine blockers and for the
Phase 10 release-approval gate. Implementation proceeds in roadmap order, one
phase per commit.

## Last completed work

Phase 3: `@technical-clipper/core` is now the real browser-independent
foundation — typed IR family (`decisions/0011`), provenance/confidence
(`0012`), diagnostics registry + `deriveExportStatus` (`0015`), canonical JSON

- `norm/*` rulesets + content-addressable ids + SHA-256 hashing + fence
  selection (`0014`, `0016`), and `validateDocumentIR`. ~71 deterministic unit
  tests. Fence selection shares its case table with the Phase 2 skill verifier
  (`decisions/0021`). Scaffold `CORE_PACKAGE_STATUS` removed;
  `notImplemented`/`NotImplementedError` kept for the downstream scaffolds.

## Unresolved decisions

None blocking. Phase 4 introduces phase-local ADRs: DOM library choice
(prefer `linkedom`), the article-root scoring function, and the Wikipedia
infobox policy. Phase 4 also wires the detector/adapter seams from
`decisions/0013` with stub registries (real detectors Phase 5, adapters
Phase 6).

## Verification state

`pnpm` not on PATH; use `npx --yes pnpm@9.12.0 <cmd>`.
`npx --yes pnpm@9.12.0 run ci` — green: `format:check` clean, `lint` 0 errors,
`tsc -b` passes, 11 test files / 71 tests pass, `skill:verify` PASS.

## Working-tree state

Git repo on `master`, tracking `origin/master`
(<https://github.com/ctosullivan/technical-clipper.git>). Phases 0–2 pushed;
Phase 3 commit pending. Nothing tagged or released.

## Next concrete action

Begin **Phase 4** per
`planning/phase-4-dom-capture-and-article-extraction.md`: pin a DOM library
(ADR), build `clone.ts` with the network trap, the sentinel substitution/
restore seam (`decisions/0013`) driven by a stub detector, deterministic
article-root selection (ADR) with the `TC-EXTRACT-NOROOT` fatal path, general
extraction DOM→`ArticleIR`, noise removal → `RemovedRegion`, the Wikipedia
infobox policy (ADR), assemble + `validateDocumentIR`, and the first ~12
article fixtures (incl. ≥3 revision-pinned Wikipedia) with
`tests/pipeline-article.test.ts`. Commit `feat(phase-4): …` and push.
