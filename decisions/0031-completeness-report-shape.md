# 0031. Completeness-report shape and the expected-outline fixture convention

## Status

Accepted (Phase 8).

## Context

`decisions/0015` fixed the diagnostics model and the export-status derivation
table. `planning/v0-to-mvp-planning-prompt.md` § 3.3 / § 12 require a "concise
completeness report" the extension shows before export (detected / exact /
approximate / failed code counts, capture-scope warnings), and gate 5 says a
capture that lost an expected section / citation target / referenced figure
"cannot report `complete`". Phase 8 needs a concrete report structure and a
way for a fixture to declare what content it expects.

## Decision

### `evaluateCapture(doc, options)` → `CompletenessReport`

```
CompletenessReport {
  status, reason, canExport, requiresVisibleWarning,   // from deriveExportStatus
  counts: { info, warning, error, fatal },
  code: { detected, exact, normalized, approximate, failed },
  citations: { total, resolved },
  sections: { expected, kept },
  warnings: string[],          // human capture-scope / uncertainty lines
  diagnostics: Diagnostic[],   // the ordered set the status was derived from
}
```

It runs (unless `alreadyValidated`) `validateDocumentIR`, then the cross-stage
assertions in `evaluate/assertions.ts`:

- **content present** — no blocks / no messages → `TC-ASSEMBLE-EMPTY`,
  incomplete.
- **code accounting** — `detected === exact + normalized + approximate +
failed`; any `failed` ⇒ incomplete (→ `partial`); any `approximate` ⇒
  handled by the existing `TC-EXTRACT-RECONSTRUCT` warning (→
  `complete_with_warnings`).
- **citations / footnotes** — every `footnoteRef` label resolves to a
  `footnoteDefinition`; numeric `citationRef` `[n]` requires an nth
  `ReferenceEntry`. Unresolved ⇒ `TC-EXTRACT-CITATION-UNRESOLVED`, incomplete.
- **section retention** — only when an `expectedOutline` is supplied: every
  `{level, text}` must appear in `body.metadata.outline`. Missing ⇒
  `TC-EXTRACT-SECTION-LOST`, incomplete.

`incomplete` from any assertion is passed to `deriveExportStatus` as
`contentKnownIncomplete`, forcing at least `partial`.

Sentinel balance and render-back are already enforced in the pipeline / the
renderer; `evaluateCapture` surfaces their diagnostics but does not re-run
them.

### Expected-outline fixture convention

A fixture that exercises section loss adds `expected-outline.json` — a JSON
array of `{ level, text }`. `scripts/capture-fixture.mjs` passes it to
`evaluateCapture`; production captures have no such file and section retention
is skipped (there is no second source to compare against without a network
call — `decisions/0001`).

### Pipeline wiring

`capture()` `finalize()` calls `evaluateCapture(doc, { alreadyValidated: true })`
and returns its decision + the report on `CaptureResult.report`. The extension
(Phase 9) renders `report`; the bundle's `diagnosticsSummary` is derived from
`report.counts`.

## Alternatives considered

- **NLP-based "referenced figure missing" detection** — rejected (§ 12: "keyed
  off a fixture marker, not NLP"). The MVP checks structural integrity (figure
  nodes have URLs; that is guaranteed at extraction) and defers a
  prose-reference check.
- **Fetch the live page's TOC to compare sections** — rejected: a network
  request during evaluation (`decisions/0001`).
- **A separate `report.json` in the bundle** — deferred: `manifest.json`'s
  `diagnosticsSummary` + `diagnostics.json` already carry the machine data;
  the human report is a UI concern (Phase 9).

## Consequences

- Phase 8 is essentially "implement the assertions + the report struct"; the
  status table was already `decisions/0015`.
- Each fixture gains `expected-report.json`; a section-loss fixture
  (`fixtures/articles/section-loss`) pins gate 5.
- Adding an assertion means a registry code (if new) + a fixture + a row in
  `tests/evaluate.test.ts`.
