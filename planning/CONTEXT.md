# Context — current resumption checkpoint

This file is a single current snapshot, not a log. Overwrite it at every
natural stopping point. History lives in git and `CHANGELOG.md` — see
`AGENTS.md` § "Roadmap and context".

## Active phase

Phase 8 — Validation and completeness diagnostics — status: **done**.
Next: Phase 9 (`planning/phase-9-chromium-extension-and-obsidian-handoff.md`).

The user has authorised implementing the phase plans through to the MVP and
pushing each phase commit, stopping only for genuine blockers and for the
Phase 10 release-approval gate. Implementation proceeds in roadmap order, one
phase per commit.

## Last completed work

Phase 8: `packages/core/src/evaluate/` — `evaluateCapture(doc)` runs the
cross-stage fidelity assertions (content present, code accounting,
citation/footnote resolution, section retention) → `CompletenessReport`
(`decisions/0031`). `capture()` returns `report`; `contentKnownIncomplete`
forces at least `partial`. Every fixture has `expected-report.json`;
`fixtures/articles/section-loss` + `expected-outline.json` pin § 12 gate 5.
CI green: 19 files / 147 tests.

## Unresolved decisions

None blocking. Phase 9 has several **phase-local** ADRs to make: extension
results surface (popup vs page), extension bundler (deferred from
`decisions/0010` — likely `vite` + `@crxjs` or `esbuild`), the Obsidian
handoff mechanism + content-size guard, and in-page vs worker execution
context. Phase 9's stop-and-ask conditions include: Obsidian handoff can't
handle planned content sizes; a feature needs a broader browser permission
than the action requires; the next step is packaging/signing/store submission
(that is Phase 10 + explicit approval — Phase 9 must not go there).

## Verification state

`pnpm` not on PATH; use `npx --yes pnpm@9.12.0 <cmd>`.
`npx --yes pnpm@9.12.0 run ci` — green: `format:check` clean, `lint` 0 errors,
`tsc -b` passes, 19 test files / 147 tests pass, `skill:verify` PASS.
`node scripts/capture-fixture.mjs --all` — PASS (goldens match, deterministic,
bundles byte-stable, reports match).

## Working-tree state

Git repo on `master`, tracking `origin/master`
(<https://github.com/ctosullivan/technical-clipper.git>). Phases 0–7 pushed;
Phase 8 commit pending. Nothing tagged or released.

## Next concrete action

Begin **Phase 9** per
`planning/phase-9-chromium-extension-and-obsidian-handoff.md`: pick the
extension bundler (ADR) and produce a loadable unpacked `dist/`; wire
`activeTab` + `scripting` into the manifest (manifest test asserts the
permission set); `content/capture.ts` clones the live DOM and runs the
pipeline (network trap kept); a results page shows the preview (sanitized
render) + the `CompletenessReport`; Copy / Send-to-Obsidian (URI + size
guard + fallback, ADR) / Download-bundle actions with the export gate
(`failed` disables, `partial` shows a non-dismissible warning);
`tests/extension-*.test.ts` over served fixtures. Replace the
`docs/cli-or-extension-reference.md` stub. Commit `feat(phase-9): …`, push;
**do not** package for a store or tag.
