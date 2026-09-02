# 0023. In-house deterministic article extractor and root-selection scoring

## Status

Accepted (Phase 4). Refines `decisions/0005` ("a Defuddle-style extractor").

## Context

`decisions/0005` calls for "a general article extractor such as Defuddle" for
ordinary content. Phase 4 must turn a cloned DOM into `ArticleIR` with: a
deterministic main-content root, source-order block preservation, recorded
`RemovedRegion`s, and tight integration with the sentinel protocol
(`decisions/0013`). The Phase 4 stop-and-ask conditions explicitly include
"the chosen general extractor produces non-deterministic output for identical
input."

## Decision

Build a **purpose-built, Defuddle-inspired extractor** in
`packages/pipeline/src/extract/`, rather than depending on Defuddle or
Readability. It is a pure function of the cloned DOM.

### Root selection (`extract/article-root.ts`)

1. Candidate set: `<main>`, `<article>`, `[role=main]`, `#content`,
   `.mw-parser-output` (Wikipedia parser output), `#mw-content-text`, and every
   `<div>`/`<section>` whose direct text-bearing descendants exceed a size
   threshold.
2. Score each candidate:
   `score = textLength - 5 * linkTextLength - 25 * navLikeChildren
   - 30 * semanticTagBonus + 10 * paragraphCount`where`navLikeChildren`counts`<nav>`, `<aside>`, `<footer>`, `[role=navigation]`,
`.navbox`, cookie/consent containers among the candidate's children.
3. Highest score wins; ties broken by document order (earlier wins).
4. If the best score is below a floor, or no candidate has any paragraph,
   emit fatal `TC-EXTRACT-NOROOT` and produce no `ArticleIR`.
5. `ArticleRootProvenance` records the chosen `selectorPath`, the method
   version, and every candidate's score.

### Block extraction (`extract/blocks.ts`)

Walk the chosen root in document order, mapping elements to `BlockNode` /
`InlineNode` per `decisions/0011`:

- headings `h1`–`h6`, `p`, `ul`/`ol`/`li` (nested, tight/loose from blank-line
  and multi-block heuristics), `blockquote`, `pre`/`code` (only via a sentinel —
  the extractor never emits `codeBlock` itself), `table` (semantic tables →
  `TableIR`), `figure`/`figcaption` → `figure`, `img` → `figure` or inline
  `image`, `hr` → `thematicBreak`, `sup.reference` / `[id^=fn]` → footnote and
  citation refs, reference lists → `ReferenceEntry[]`.
- Links resolved to absolute against the capture `sourceUrl`/`canonicalUrl`.
- Unknown / unsupported elements with block content → `htmlBlock` (stored
  verbatim, sanitized only on render) with a `TC-RENDER-UNKNOWN-NODE`-adjacent
  note; never silently dropped.
- All prose text passes `norm/prose@1`; ids via `decisions/0014`.

### Noise removal (`extract/noise.ts`)

Before block extraction, within the chosen root, classify and remove:
`nav`, `aside`, `footer`, `[role=navigation]`, `.navbox`, `.mw-editsection`,
`.mw-jump-link`, edit/print/share controls, cookie/consent banners,
"related content" / "recommended" panels, and repeated site chrome. Each
removal is recorded as a `RemovedRegion` with a `reason`. A removal that would
drop a heading or a large text block emits a `warning` rather than proceeding
silently.

## Alternatives considered

- **Depend on Defuddle** — rejected: browser-oriented, brings its own DOM
  assumptions, harder to guarantee run-to-run determinism, and couples our
  release gates to an external project's behaviour changes. The sentinel
  integration and `RemovedRegion` accounting need extractor-internal hooks.
- **Depend on @mozilla/readability** — rejected: same coupling concerns; its
  scoring is tuned for "reader mode" not fidelity, and it mutates/By-clones in
  ways that fight the sentinel step.
- **Pure semantic-tag extraction (take `<article>`, done)** — rejected: fails
  on real pages with multiple `<article>` elements, `<div>`-only layouts, and
  Wikipedia (`.mw-parser-output` is a `<div>`).

## Consequences

- No runtime dependency on an external extraction library; the deterministic
  path stays auditable.
- The scoring constants live in one exported table; changing them is an ADR +
  regenerated fixtures.
- If a future fixture class genuinely cannot be handled by generic scoring
  without per-site rules, that is a `decisions/0005` stop-and-ask (do not add a
  site scraper silently) — a ClipSpec `articleRootSelector` (`decisions/0018`)
  is the sanctioned escape hatch.
