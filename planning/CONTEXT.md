# Context — current resumption checkpoint

This file is a single current snapshot, not a log. Overwrite it at every
natural stopping point. History lives in git and `CHANGELOG.md` — see
`AGENTS.md` § "Roadmap and context".

## Active phase

Phase 7 — Deterministic rendering and capture bundle — status: **done**.
Next: Phase 8 (`planning/phase-8-validation-and-completeness-diagnostics.md`).

The user has authorised implementing the phase plans through to the MVP and
pushing each phase commit, stopping only for genuine blockers and for the
Phase 10 release-approval gate. Implementation proceeds in roadmap order, one
phase per commit.

## Last completed work

Phase 7: `packages/core/src/render/` (IR→Markdown, three profiles, degrade
table `decisions/0030`, render-back verification) and
`packages/core/src/bundle/` (canonical JSON writers, `manifest.json`
identity/event split `decisions/0017`, hand-rolled STORE-only deterministic
ZIP `decisions/0029`, `assembleBundle`). ADRs 0028–0030. Every fixture has
per-profile `expected.*.md` + `expected-hashes.json` goldens.
`docs/capture-format.md` replaced. CI green: 17 files / 131 tests.

## Unresolved decisions

None blocking. Phase 8 has no new ADRs likely (the derivation table and
diagnostics model are `decisions/0015`; the completeness-report shape may need
one small ADR). Phase 8 implements `packages/core/src/evaluate/` —
`evaluateCapture(doc)` running the cross-stage fidelity assertions (section
retention, citation/footnote targets, referenced figures, code accounting,
conversation order/roles, page-load) that can demote a capture to `partial`,
plus the completeness-report structure the extension (Phase 9) shows. The
pipeline currently runs `validateDocumentIR` + `deriveExportStatus`; Phase 8
adds the assertion layer on top and threads `contentKnownIncomplete` into the
status derivation.

## Verification state

`pnpm` not on PATH; use `npx --yes pnpm@9.12.0 <cmd>`.
`npx --yes pnpm@9.12.0 run ci` — green: `format:check` clean, `lint` 0 errors,
`tsc -b` passes, 17 test files / 131 tests pass, `skill:verify` PASS.
`node scripts/capture-fixture.mjs --all` — PASS (goldens match, deterministic,
bundles byte-stable).

## Working-tree state

Git repo on `master`, tracking `origin/master`
(<https://github.com/ctosullivan/technical-clipper.git>). Phases 0–6 pushed;
Phase 7 commit pending. Nothing tagged or released.

## Next concrete action

Begin **Phase 8** per
`planning/phase-8-validation-and-completeness-diagnostics.md`: implement
`packages/core/src/evaluate/` (`assertions.ts`, `report.ts`, `evaluate.ts`),
add the completeness diagnostic codes to the registry, extend the relevant
fixtures with `expected-outline.json` / `expected-report.json`, wire
`evaluateCapture` into the pipeline result, and add
`tests/evaluate-*.test.ts`. Commit `feat(phase-8): …` and push.
