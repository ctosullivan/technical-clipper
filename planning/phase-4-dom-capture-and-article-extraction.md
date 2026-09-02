# Phase 4 — DOM capture and standard article extraction

## Status

planned

## Goal and user-visible outcome

A runnable, offline capture pipeline that turns a saved HTML fixture into a
validated `ArticleIR`: clone the rendered DOM, run the detector→sentinel seam
(detectors themselves are stubs until Phase 5), select a deterministic article
root, run general (Defuddle-style) extraction over the sentinel-bearing clone,
apply the adapter seam (adapters stubbed until Phase 6), restore sentinels, and
assemble + validate the IR with provenance, `RemovedRegion`s, and diagnostics.
Wikipedia and ordinary semantic articles work through the **generic** path. No
extension UI yet; verified entirely by fixture tests and a headless runner.

## Scope covered

- `packages/core` (or a new `packages/pipeline`) capture orchestrator:
  `capture(html, context): DocumentIR` running steps 1–7 of
  `architecture/overview.md`, with detectors/adapters injected as registries.
- DOM handling: parse fixture HTML with a pinned DOM implementation
  (`linkedom` or `jsdom` — decided by ADR in this phase, `linkedom` preferred
  for speed/determinism), clone, **no** script execution, **no** network
  (enforced by a trap).
- Deterministic article-root selection: a scored-candidate algorithm
  (content density, semantic tags, link density, `RemovedRegion` heuristics)
  with a fully documented, testable scoring function; ties broken by document
  order; failure → fatal `TC-EXTRACT-NOROOT`.
- General extraction: DOM subtree → `ArticleIR` block/inline nodes for
  headings, paragraphs, lists (nested), blockquotes, tables, figures/captions,
  images (as refs), links (resolved absolute), inline code, footnotes,
  citations, reference lists, thematic breaks, raw HTML blocks (stored as
  text). Reading order preserved; heading hierarchy preserved.
- Noise removal with recorded `RemovedRegion`s: navigation, edit controls,
  cookie/consent UI, related-content, repeated chrome, footers — never a
  silent article-section drop.
- Wikipedia specifics through the generic path: lead, section nesting,
  infobox (included when part of selected article content, per a **documented
  policy** — default: include, tagged `figure`/`table` with an `info`
  diagnostic), tables, figures/captions, notes, citations, references; nav
  boxes / edit links / page controls excluded.
- Sentinel substitution + restore wired to `decisions/0013`; sentinel-loss
  detection (fatal).
- ClipSpec `articleRootSelector` / `dropSelectors` / `keepSelectors` honoured
  (resolver from Phase 6 stubbed to "no spec" here; the hooks exist).
- A headless CLI runner `scripts/capture-fixture.mjs <dir>` for local/debug
  use (not shipped).

## Explicit deferrals / non-goals

- Real code detectors (Phase 5) and real adapters (Phase 6) — only the seams
  and stub registries here.
- Markdown rendering / bundle (Phase 7).
- Cross-stage completeness assertions beyond "root found / sentinels balanced /
  IR valid" (Phase 8).
- Extension shell (Phase 9).
- Cross-origin iframe traversal, screenshot/OCR, image mirroring (non-goals).

## Dependencies and assumptions

- Depends on Phase 3 (IR, validation, ids, normalization, diagnostics) and
  `decisions/0011`–`0016`.
- Assumes fixtures are **rendered** HTML snapshots (post-JS DOM), saved as
  `source.html`, matching what a content script would see.
- Assumes a pinned DOM library is acceptable in the pipeline (not the
  deterministic _core_, which stays DOM-free) — ADR in this phase.
- Assumes Defuddle (or the chosen extractor) is vendored/pinned and offline;
  if its output is non-deterministic for equal input, that is a stop-and-ask.

## Design decisions already settled

`decisions/0005` (generic path + sentinels, no WP scraper), `0011` (`ArticleIR`),
`0013` (detector/adapter seam + sentinel protocol), `0012` (provenance),
`0015` (diagnostics/status), `0016` (normalization/ids for prose).
New this phase: DOM library choice; article-root scoring function; infobox
policy — each an ADR.

## Files to add/change

| Path                                                        | Purpose                                                                            |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `packages/pipeline/` (new) or `packages/core/src/pipeline/` | Capture orchestrator + stage interfaces                                            |
| `.../dom/clone.ts`                                          | Rendered-DOM clone, script strip, network trap                                     |
| `.../extract/article-root.ts`                               | Deterministic root selection + scoring                                             |
| `.../extract/general.ts`                                    | DOM → `ArticleIR` nodes (wraps the pinned extractor)                               |
| `.../extract/noise.ts`                                      | Noise classification → `RemovedRegion`                                             |
| `.../sentinels.ts`                                          | Substitution + restore + loss detection                                            |
| `.../registry.ts`                                           | Detector + adapter registries (injectable, empty defaults)                         |
| `.../clipspec.ts`                                           | ClipSpec hook points (resolver stubbed)                                            |
| `scripts/capture-fixture.mjs`                               | Headless fixture runner                                                            |
| `fixtures/articles/**`                                      | First ~12 article fixtures (rest in Phase 10) incl. ≥3 Wikipedia, noisy, malformed |
| `decisions/00NN-dom-library.md`                             | DOM implementation choice                                                          |
| `decisions/00NN-article-root-selection.md`                  | Scoring algorithm + tie-breaks                                                     |
| `decisions/00NN-wikipedia-infobox-policy.md`                | Include/exclude/tag policy                                                         |
| `packages/*/src/**/*.test.ts`                               | Unit + fixture tests                                                               |
| `tests/pipeline-article.test.ts`                            | Integration over `fixtures/articles/*`                                             |
| `architecture/overview.md`                                  | Pipeline steps 1–7 move from target to current                                     |
| `docs/capture-format.md`                                    | Article IR coverage described                                                      |
| `CHANGELOG.md`                                              | Phase 4 entry                                                                      |

## Implementation sequence

1. ADR + wire the pinned DOM library; `clone.ts` with the network trap and a
   test proving `fetch`/`XHR`/`sendBeacon`/`Image` load throws during capture.
2. `sentinels.ts` against `decisions/0013` with a stub detector that marks a
   `<pre>` — prove substitute/restore/loss.
3. `article-root.ts`: scoring function + ADR; fixtures for clean, noisy, and
   ambiguous roots; `TC-EXTRACT-NOROOT` fatal path.
4. `general.ts`: integrate the extractor; map its output to `ArticleIR` nodes;
   resolve links/images to absolute; build nested lists/tables/figures;
   footnotes/citations/references association.
5. `noise.ts`: classify + record `RemovedRegion`; assert no marked article
   section is dropped.
6. Infobox policy ADR + implementation for the Wikipedia fixtures.
7. Assemble `DocumentIR` (`captureKind` = `article` unless a later code
   detector/adapter bumps it to `technical_article`), run
   `validateDocumentIR`, derive status.
8. `capture-fixture.mjs` runner; author the ~12 fixtures with `provenance.json`
   (Wikipedia revision-pinned per `decisions/0020`).
9. Integration test over all article fixtures: IR deep-equal, diagnostics
   deep-equal, status equal, determinism (run twice).
10. Update `architecture/overview.md`, `docs/capture-format.md`,
    `CHANGELOG.md`.
11. Direct review of `article-root.ts`, `general.ts`, `noise.ts`,
    `sentinels.ts`.
12. `pnpm run ci`.
13. If authorized, commit `feat(phase-4): DOM capture and article extraction`.

## Test fixtures and edge cases

- Wikipedia article with infobox, nested sections, `<ref>` citations,
  reference list, wide table, figure with caption.
- Ordinary blog/news/docs article; article with footnotes; repeated identical
  headings (ids stay unique); in-page fragment links (`#section`) resolved.
- Noisy page: cookie banner + nav + "related articles" + edit pencil + footer
  around the body → all in `removedRegions`, none in `blocks`.
- Malformed root: two plausible `<article>` elements; empty `<main>`;
  body-only page → diagnostics, status not `complete`.
- Page still showing skeleton loaders / below-fold lazy images → `PageLoadState`
  populated, `warning`.
- A `<pre>` present (stub detector) → sentinel round-trips; simulated sentinel
  loss → fatal.

## Runnable verification and expected outcomes

```sh
pnpm run ci
pnpm test -- tests/pipeline-article.test.ts
   # expect: every fixture's IR / diagnostics / status match expected;
   #         second run identical (determinism); no network trap triggered
node scripts/capture-fixture.mjs fixtures/articles/wikipedia-<slug>
   # expect: prints validated IR summary + status 'complete' for the clean WP case
```

## Documentation / ADR / changelog effects

- 3 new ADRs (DOM library, root selection, infobox policy).
- `architecture/overview.md` steps 1–7 → current; `core`/`pipeline` rows
  updated.
- `docs/capture-format.md` article coverage section.
- `CHANGELOG.md` Phase 4 entry; `ROADMAP.md` Phase 4 → `done`; `CONTEXT.md` →
  Phase 5.

## Stop-and-ask conditions specific to this phase

- The chosen general extractor produces non-deterministic output for identical
  input.
- Deterministic article-root selection cannot be achieved for a realistic
  fixture class without site-specific rules (would push toward a per-site
  scraper — forbidden by `decisions/0005`).
- A normalization needed to make article text match expected IR would change
  code bytes inside a protected block.
- Honouring an existing repo/test expectation would require expanding a
  non-goal (iframe traversal, image mirroring).
- Tests pass but review finds an article-section silently dropped without a
  `RemovedRegion`.

## Completion evidence to record

- Fixture list with provenance (Wikipedia revision IDs/URLs).
- Article-root scoring function description + the fixtures that pin it.
- Determinism check output (two identical runs).
- Network-trap test output.
- Review notes for the four core modules.
- `pnpm run ci` output; commit hash once authorized.
