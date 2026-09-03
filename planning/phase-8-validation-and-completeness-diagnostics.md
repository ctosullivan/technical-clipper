# Phase 8 — Validation and completeness diagnostics

## Status

done

## Completion evidence

- **`packages/core/src/evaluate/`:** `assertions.ts` (`runAssertions` —
  content-present, code accounting, citation/footnote resolution, section
  retention against a supplied outline), `evaluate.ts` (`evaluateCapture` →
  `CompletenessReport` with status/reason/gate-flags/counts/warnings),
  `index.ts`.
- **ADR:** `decisions/0031` (report shape + `expected-outline.json` fixture
  convention). No new diagnostic codes — the registry from `decisions/0015`
  already had `TC-EXTRACT-SECTION-LOST` / `-CITATION-UNRESOLVED` /
  `-FIGURE-MISSING` / `TC-ASSEMBLE-EMPTY`.
- **Pipeline wiring:** `capture()` `finalize()` calls
  `evaluateCapture(doc, { alreadyValidated: true })`, appends its assertion
  diagnostics, and returns `report` on `CaptureResult`. The shell (no-root)
  path also returns a `report`.
- **Fixtures:** every fixture now has `expected-report.json`;
  `fixtures/articles/section-loss` + its `expected-outline.json` pin § 12
  gate 5 (`status: partial`, `sections: {expected: 3, kept: 2}`).
  `scripts/capture-fixture.mjs` evaluates against `expected-outline.json` when
  present.
- **Tests:** `packages/core/src/evaluate/evaluate.test.ts` (10 — code
  accounting sum, approximate → warnings, failed → partial, section retention,
  unresolved footnote, conversation); `tests/evaluate.test.ts` (7 — corpus
  report goldens, gate 5, canExport-only-on-failed, partial-requires-warning,
  code-accounting sum for every fixture). `pnpm run ci` green: 19 test files /
  147 tests.
- **Deferred as planned:** the prose-referenced-figure check is structural
  only for the MVP (`decisions/0031`); the extension UI that shows the report
  is Phase 9.
- **Commit:** see `planning/CONTEXT.md`.

The scope and plan below are the original Phase 1 statement, retained for
context.

## Goal and user-visible outcome

The policy layer that decides whether a capture may be exported and at what
status. Implements the `decisions/0015` derivation table plus the cross-stage
fidelity assertions that can demote a capture to `partial` — e.g. "an expected
article section, citation target, or referenced figure was lost ⇒ cannot report
`complete`" (§ 12). After this phase, every capture carries a defensible
`exportStatus` and a completeness report the extension can show verbatim. No
UI; verified by fixtures spanning the whole pipeline.

## Scope covered

- `evaluateCapture(doc): { status, report, diagnostics }` — the single entry
  point the extension (Phase 9) calls after `capture()` + render.
- Cross-stage assertions (each emits a specific diagnostic + may set `partial`
  / `failed`):
  - **Sentinel balance** — every detected leaf restored; none lost/orphaned
    (fatal `TC-EXTRACT-SENTINEL-LOST` / `TC-ASSEMBLE-ORPHAN-SENTINEL`).
  - **Section retention** — for fixtures with an expected section outline, a
    missing expected heading/section ⇒ `error` + `partial`.
  - **Citation/footnote targets** — every `citationRef`/`footnoteRef` resolves
    to a `ReferenceEntry`/`FootnoteDefinition`; unresolved ⇒ `error` +
    `partial`.
  - **Referenced figures** — a figure referenced from prose but absent ⇒
    `error` + `partial`.
  - **Code accounting** — `detected` == `exact` + `approximate` + `failed`;
    any `failed` ⇒ at least `partial`; any `approximate` ⇒ at least
    `complete_with_warnings`.
  - **Conversation** — message `order` contiguous from 0; roles all assigned;
    `branchEvidence` sufficient (else fatal).
  - **Page load** — `conversationStreaming` ⇒ fatal; other `PageLoadState`
    signals ⇒ `warning` (or `partial` if a required region is affected).
  - **Render integrity** — render-back mismatch ⇒ fatal (raised in Phase 7,
    surfaced here).
- The **completeness report** structure (consumed by Phase 9 UI and written
  into the bundle as part of `diagnostics.json` / manifest summary):
  counts (`detected/exact/approximate/failed` code; sections kept/expected;
  citations resolved/total), capture-scope warnings, the ordered diagnostics
  list, and the derived `exportStatus` with a one-line reason.
- The **export gate**: `canExport = status !== 'failed'`; for `partial`,
  `requiresVisibleWarning = true`.

## Explicit deferrals / non-goals

- No new extraction/rendering behaviour — this phase only _inspects_ the IR +
  render output and _classifies_.
- No UI (Phase 9); no release-gate corpus filling (Phase 10) — though this
  phase's assertions are exactly what several gates check.
- "Expected outline" for section-retention is fixture-provided in tests; the
  MVP does not fetch a canonical outline from the live page (that would need
  network / a second source).

## Dependencies and assumptions

- Depends on Phases 3–7 (full pipeline + render output available).
- Assumes fixtures that exercise loss can encode an `expected-outline.json` /
  `expected-report.json` alongside the existing files (`decisions/0020`
  layout extension — documented here).
- Assumes the extension will call `evaluateCapture` and honour `canExport` /
  `requiresVisibleWarning` (Phase 9 plan references this).

## Design decisions already settled

`decisions/0015` (diagnostics model, severity meanings, derivation table,
fatal set, degrade set, export gate), `0017` (`PageLoadState` severity),
`0012` (code accounting via confidence), `0008` (branch evidence). New this
phase: the completeness-report shape (ADR) and the `expected-outline` fixture
convention (folded into the `0020` layout via an amendment note or a small
ADR).

## Files to add/change

| Path                                          | Purpose                                                               |
| --------------------------------------------- | --------------------------------------------------------------------- |
| `packages/core/src/evaluate/assertions.ts`    | cross-stage fidelity assertions                                       |
| `packages/core/src/evaluate/report.ts`        | completeness-report builder                                           |
| `packages/core/src/evaluate/evaluate.ts`      | `evaluateCapture()` entry point                                       |
| `packages/core/src/evaluate/*.test.ts`        | unit tests per assertion                                              |
| `packages/core/src/diagnostics/registry.ts`   | add the completeness diagnostic codes                                 |
| `fixtures/**/expected-outline.json`           | expected section outline for retention tests (where relevant)         |
| `fixtures/**/expected-report.json`            | expected completeness report + status                                 |
| `tests/evaluate-*.test.ts`                    | end-to-end: capture → render → evaluate → assert report/status        |
| `decisions/00NN-completeness-report-shape.md` | report structure + outline fixture convention                         |
| `architecture/overview.md`                    | add the evaluate stage after step 7                                   |
| `docs/capture-format.md`                      | completeness report section; export gate rules                        |
| `docs/cli-or-extension-reference.md`          | describe the report the user will see (still "planned" until Phase 9) |
| `CHANGELOG.md`                                | Phase 8 entry                                                         |

## Implementation sequence

1. Add completeness diagnostic codes to the registry.
2. `assertions.ts`: implement each assertion independently with focused unit
   tests (pass case + each failure case).
3. `report.ts`: assemble counts + warnings + diagnostics + status + reason;
   deterministic ordering.
4. `evaluate.ts`: run assertions, feed diagnostics into
   `deriveExportStatus` (Phase 3), produce the report + gate flags.
5. Extend the relevant fixtures with `expected-outline.json` /
   `expected-report.json`; ADR for the convention + report shape.
6. `tests/evaluate-*.test.ts`: for each of a section-loss fixture, a
   citation-loss fixture, a failed-code fixture, an approximate-code fixture,
   a streaming-conversation fixture, a clean article, a clean conversation —
   assert the exact status + report.
7. Update architecture + docs + changelog.
8. Direct review: walk the derivation table row by row against
   `assertions.ts` + `deriveExportStatus`; confirm no path lets uncertainty
   through as `complete`.
9. `pnpm run ci`.
10. If authorized, commit `feat(phase-8): validation and completeness
diagnostics`.

## Test fixtures and edge cases

- Article missing one expected `<h2>` section → `error`,
  `status: 'partial'`, report names the missing section.
- Citation `[12]` with no matching reference entry → `error`, `partial`.
- Figure referenced as "see Figure 3" but Figure 3 absent → `error`, `partial`
  (assertion keyed off a fixture marker, not NLP).
- One `failed` code block among 4 → `partial`; code counts `4 detected /
3 exact / 0 approximate / 1 failed`.
- One `approximate` (Prism reconstruction) block, nothing else wrong →
  `complete_with_warnings`.
- Clean Wikipedia article, all sections/citations/figures present →
  `complete`.
- Conversation with a gap in `order` (0,1,3) → fatal.
- Conversation captured mid-stream → fatal, `canExport:false`.
- Noisy page where noise removal was correct and no article section lost →
  `complete` (noise removal alone never demotes).

## Runnable verification and expected outcomes

```sh
pnpm run ci
pnpm test -- tests/evaluate-status.test.ts
   # expect: each fixture yields exactly its expected-report.json (status,
   #         counts, ordered diagnostics, reason); determinism holds;
   #         no fixture with known loss reports 'complete';
   #         canExport is false only for the 'failed' fixtures
```

## Documentation / ADR / changelog effects

- 1 new ADR (completeness-report shape + outline fixture convention).
- `architecture/overview.md` gains the evaluate stage.
- `docs/capture-format.md` completeness-report + export-gate section.
- `CHANGELOG.md` Phase 8; `ROADMAP.md` Phase 8 → `done`; `CONTEXT.md` →
  Phase 9.

## Stop-and-ask conditions specific to this phase

- A completeness assertion needs a second data source / network call to be
  meaningful (e.g. "did we get every section?" with no expected outline
  available outside tests) — surface the limitation, don't fake it.
- The derivation table produces a contradictory status for a real fixture
  (e.g. an assertion says `partial` but another path says `complete`).
- Tests pass but review finds a path where an `approximate`/`failed` artifact
  can reach `complete` (§ 16).
- Making a fixture pass would require weakening a fatal condition from
  `decisions/0015`.

## Completion evidence to record

- The derivation-table-vs-code review notes (row by row).
- Status outcomes for the full fixture set (the `expected-report.json`
  coverage).
- Confirmation `canExport`/`requiresVisibleWarning` behave per the gate.
- `pnpm run ci` output; commit hash once authorized.
