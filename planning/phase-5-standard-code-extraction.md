# Phase 5 — Standard code extraction

## Status

planned

## Goal and user-visible outcome

Real `ComponentDetector` implementations that turn code-bearing DOM into
`CodeBlockIR` / `TerminalSessionIR` with exact text, correct
language/confidence/evidence, and no chrome contamination — feeding the
sentinel seam from Phase 4. After this phase, a captured technical article's
code blocks are preserved exactly (byte-for-byte against the copy-source node)
or explicitly marked `approximate`/`failed`. Verified by the code fixture
corpus; no UI.

## Scope covered

- Detectors (priority order per `decisions/0013`):
  - `code/pre-code` (priority 10) — standard `<pre><code>` and bare `<pre>`.
  - `code/blocklevel-code` (10) — non-standard block-level / preformatted
    `<code>` patterns.
  - `code/prism` (20) — Prism-highlighted blocks: prefer a copy-source /
    `data-*` raw node; else `dom-rendered-reconstruction` from token spans
    with `confidence: approximate` + diagnostic.
  - `code/highlightjs` (20) — Highlight.js blocks, same evidence rules.
  - `terminal/session` (40) — explicitly marked terminal input/output where
    the DOM exposes the distinction (prompt spans, `data-*`, distinct
    input/output containers); ambiguous split → `approximate` + diagnostic.
- Language inference: page-declared (`language-xxx` / `lang-xxx` class, info
  attribute, adapter) → `class-token`/`info-string` evidence; otherwise a
  conservative heuristic → `inferred-heuristic` + `warning` when low
  confidence; never guess silently as high confidence.
- Chrome stripping: line-number gutters, copy buttons, "Copy"/"Copied"
  labels, language pills, prompt decorations, syntax-token anchor links —
  removed from `text`, asserted by fixtures (`decisions/0020` gate 10).
- Filename/caption and highlighted-line metadata captured when exposed
  (figcaption, `data-filename`, title bar, `{1,3-5}` metastrings).
- Final-newline detection; BOM handling per `norm/code@1`.
- Overlap resolution fixtures: `<pre>` inside a would-be tab group; a terminal
  rendered with Prism classes; nested `<code>` inside `<pre>`.
- `code/*` fixture corpus: standard HTML, Prism, Highlight.js, block-level
  `<code>`, terminal, plus adversarial (virtualized editor, canvas code,
  truncated, backtick+tilde runs, mixed indentation) — building toward the
  ≥ 50-block minimum (completed in Phase 10).

## Explicit deferrals / non-goals

- Docusaurus tab **groups** and ChatGPT message code → Phase 6 (adapters).
  `code/prism` etc. still detect individual blocks that happen to sit inside
  those structures; grouping is the adapter's job.
- Markdown rendering of code (Phase 7) — only `selectFence` unit interplay is
  referenced.
- Monaco / CodeMirror / Jupyter / arbitrary virtualized editors — detected
  only enough to emit a `failed`/`approximate` diagnostic, never "recovered"
  (non-goal). Canvas/OCR recovery — never (non-goal).

## Dependencies and assumptions

- Depends on Phase 3 (`CodeBlockIR`/`TerminalSessionIR`, provenance,
  `selectFence`, ids) and Phase 4 (sentinel seam, DOM clone, registries).
- Assumes copy-source nodes, when present, hold exact text
  (`dom-text-content`); fixtures encode both the "has raw node" and "tokens
  only" cases.
- Assumes Prism/Highlight.js DOM shapes from pinned real-page snapshots, not
  from the libraries' current source.

## Design decisions already settled

`decisions/0013` (detector interface, priority table, overlap algorithm,
sentinels), `0012` (confidence/evidence — `exact` only from
`dom-text-content`/`attribute-value`), `0016` (`norm/code@1`, fence,
info-string), `0004` (code is a source artifact). New this phase: the
language-inference heuristic + its confidence thresholds (ADR).

## Files to add/change

| Path                                             | Purpose                                                   |
| ------------------------------------------------ | --------------------------------------------------------- |
| `packages/detectors/src/code/pre-code.ts`        | `<pre><code>` / `<pre>` detector                          |
| `packages/detectors/src/code/blocklevel-code.ts` | block-level `<code>` detector                             |
| `packages/detectors/src/code/prism.ts`           | Prism detector + evidence selection                       |
| `packages/detectors/src/code/highlightjs.ts`     | Highlight.js detector                                     |
| `packages/detectors/src/terminal/session.ts`     | terminal input/output detector                            |
| `packages/detectors/src/chrome.ts`               | shared chrome-stripping helpers                           |
| `packages/detectors/src/language.ts`             | language inference + evidence/confidence                  |
| `packages/detectors/src/priority.ts`             | the fixed priority table (single source)                  |
| `packages/detectors/src/index.ts`                | export the detector set; drop scaffold stub               |
| `packages/detectors/src/**/*.test.ts`            | per-detector unit tests                                   |
| `fixtures/code/**`                               | code fixtures per category (subset now, full in Phase 10) |
| `tests/pipeline-code.test.ts`                    | integration: article-with-code fixtures end to end        |
| `decisions/00NN-language-inference.md`           | heuristic + thresholds                                    |
| `architecture/overview.md`                       | `detectors` row → real                                    |
| `docs/capture-format.md`                         | code-block IR fields + evidence semantics                 |
| `CHANGELOG.md`                                   | Phase 5 entry                                             |

## Implementation sequence

1. `priority.ts` + `chrome.ts` helpers + tests.
2. `code/pre-code.ts` and `code/blocklevel-code.ts` (simplest, `exact` from
   `dom-text-content`) + fixtures incl. final-newline / BOM / empty.
3. `language.ts` + ADR; unit tests for each evidence class and the low-confidence
   `warning`.
4. `code/prism.ts` and `code/highlightjs.ts`: raw-node-first, token-reconstruct
   fallback (`approximate` + diagnostic); chrome stripping fixtures.
5. `terminal/session.ts`: clear-distinction fixtures (`exact`), ambiguous
   fixtures (`approximate` + diagnostic), interleaved input/output order.
6. Wire all detectors into the Phase 4 registry; overlap-resolution fixtures
   asserting the exact winner and the `info` diagnostic.
7. Adversarial fixtures: virtualized-editor / canvas / truncated → `failed` or
   `approximate` with the expected diagnostic, never fake content.
8. `tests/pipeline-code.test.ts`: full article-with-code fixtures — code
   round-trips through sentinels, `captureKind` becomes `technical_article`.
9. Update `architecture/overview.md`, `docs/capture-format.md`, `CHANGELOG.md`.
10. Direct review: every detector's `extract()` against `decisions/0012` (is
    the confidence/evidence pairing legal?).
11. `pnpm run ci`.
12. If authorized, commit `feat(phase-5): standard code extraction`.

## Test fixtures and edge cases

- `<pre><code>` with leading blank lines, trailing newline vs none, tabs and
  spaces mixed, a line of only whitespace.
- Prism block **with** a `data-code` raw node (→ `exact`) and one **without**
  (→ `approximate` + `TC-EXTRACT-RECONSTRUCT`).
- Highlight.js block whose token spans drop a trailing space → reconstruction
  flagged, not silently "fixed".
- Code containing ` ``` ` and `~~~` runs (fence selection later must
  cope; here we just assert exact `text`).
- Copy button + line numbers + "Copy" label + language pill all present →
  none in `text`.
- Terminal: prompt `$ ` distinguishes input; output block separate → two
  `entries`, correct streams, order preserved.
- Terminal where input/output share a container with no marker → `approximate`
  - diagnostic, not a guessed split.
- `<pre>` nested inside a tab widget → single-block detector yields the block;
  grouping deferred to Phase 6 (fixture notes this).
- Monaco-like `<div>` editor with virtualized rows → `failed` +
  `TC-DETECT-VIRTUALIZED`.

## Runnable verification and expected outcomes

```sh
pnpm run ci
pnpm test -- tests/pipeline-code.test.ts
   # expect: for every non-adversarial code fixture,
   #         CodeBlockIR.text byte-equals expected AND confidence is
   #         'exact' (or 'normalized' for the documented BOM case);
   #         adversarial fixtures produce the expected diagnostic;
   #         no 'Copy'/line-number strings in any text; determinism holds
```

## Documentation / ADR / changelog effects

- 1 new ADR (language inference).
- `architecture/overview.md` `detectors` responsibilities → current.
- `docs/capture-format.md` code-block fields + evidence table.
- `CHANGELOG.md` Phase 5; `ROADMAP.md` Phase 5 → `done`; `CONTEXT.md` →
  Phase 6.

## Stop-and-ask conditions specific to this phase

- A normalization required to match an expected fixture would change code
  bytes while the block is still labelled `exact`/`normalized`
  (`decisions/0016` / § 16).
- ChatGPT/terminal DOM cannot establish the input/output distinction from
  stable evidence for a case we intended to support.
- A detector's output is non-deterministic across runs on identical DOM.
- Supporting a fixture would require OCR/canvas/virtualized-editor recovery
  (non-goal expansion).
- Tests green but review finds an `exact` claim resting on reconstruction.

## Completion evidence to record

- Per-category code fixture counts so far (toward the ≥ 50 minimum).
- The exact-preservation assertion results (gate 6) and chrome-contamination
  results (gate 10) for the current corpus.
- Overlap-resolution fixture outcomes.
- Review notes on confidence/evidence legality per detector.
- `pnpm run ci` output; commit hash once authorized.
