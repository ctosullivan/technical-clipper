# 0024. Wikipedia infobox and page-furniture policy

## Status

Accepted (Phase 4).

## Context

`planning/v0-to-mvp-planning-prompt.md` § 4 says Wikipedia-style content such as
"the infobox when it is part of the selected article content" should be
captured, while "navigation boxes, edit links, and page controls should be
excluded unless an explicit documented policy says otherwise." This is that
policy. Wikipedia fixtures must pass through the **generic** path
(`decisions/0005`) — this policy is a set of selectors the generic noise/table
handling applies, not a Wikipedia scraper.

## Decision

Applied within the selected article root (`decisions/0023`):

### Included

- **Infobox** (`table.infobox`, `.infobox`): captured as a `TableIR` `table`
  node in its document position, and an `info` diagnostic
  `TC-EXTRACT-INFOBOX-POLICY` records that it was included. Nested images in the
  infobox become `figure` nodes / `image` refs (URLs only, never downloaded).
- Lead paragraphs, full section hierarchy, body tables, figures + captions,
  `<ref>` footnote markers and the reference list, "Notes" / "Further reading"
  lists.
- Math rendered as MathML/`<img class="mwe-math-fallback-image">`: the TeX from
  `annotation[encoding="application/x-tex"]` when present → `mathBlock.tex`;
  otherwise `mathBlock` with `tex: null` + an `approximate` diagnostic.

### Excluded (recorded as `RemovedRegion`)

- Navigation boxes: `.navbox`, `.vertical-navbox`, `.sistersitebox`,
  `.metadata.mbox-small`, `[role=navigation]`.
- Edit / section controls: `.mw-editsection`, `.mw-jump-link`,
  `#siteSub`, `#contentSub`, `.mw-indicators`, `.noprint`.
- Hatnotes (`.hatnote`) and dablinks are **kept** (they are article content),
  but `.mw-empty-elt` and coordinate widgets (`#coordinates`) are removed.
- "Retrieved from", categories (`.catlinks`, `#catlinks`), the TOC
  (`#toc`, `.toc`) — the heading hierarchy in the IR is the durable TOC.
- Reference _backlink_ arrows (`.mw-cite-backlink`) inside reference entries
  are stripped from the entry text; the entry text itself is kept.

### Determinism

The include/exclude selector lists live in
`packages/pipeline/src/extract/wikipedia-policy.ts` as one exported constant.
Changing either list is an ADR + regenerated Wikipedia fixtures.

## Alternatives considered

- **Exclude the infobox** — rejected: § 4 names it as content to capture, and a
  Wikipedia capture without the infobox loses the at-a-glance factual summary.
- **Include navboxes** — rejected: they are cross-article navigation, not this
  article's content; § 4 says exclude.
- **A Wikipedia adapter that special-cases the whole page** — rejected by
  `decisions/0005`; this policy is selector lists fed to the generic
  noise/table code, and the Wikipedia fixtures run through the generic
  pipeline with no adapter.

## Consequences

- A Wikipedia capture that drops an expected section, a citation target, or a
  referenced figure still cannot report `complete` (Phase 8 completeness
  assertions, `decisions/0015`).
- The selector lists are the first thing to revisit if a Wikipedia release
  fixture regresses; a genuine generic-path gap is a `decisions/0005`
  stop-and-ask.
