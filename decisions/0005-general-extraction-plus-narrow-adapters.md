# 0005. General extraction plus narrow adapters; no Wikipedia-only scraper

## Status

Accepted

## Context

Two competing designs are possible: (a) hand-write extraction logic per
site/family of sites, or (b) use a general semantic-article extractor for
ordinary content and add narrow, fixture-justified adapters only where a
structure genuinely can't be handled generically. Option (a) does not scale
past a handful of sites and risks a Wikipedia-only MVP that doesn't
generalize; option (b) matches the product thesis that standard articles are
a first-class path, not a fallback around code handling.

## Decision

Use a general article extractor (a Defuddle-style extractor) for ordinary
content, including representative Wikipedia articles, through the same
generic pipeline as any other semantic article. Use component detectors and
narrow adapters only for exceptional structures (Docusaurus tab groups,
ChatGPT conversations); adapters describe what is unusual rather than
reimplementing the whole page. Pre-extract and protect code by detecting
code components in a cloned rendered DOM, replacing them with stable
sentinels, running general content extraction, then restoring the structured
code nodes.

## Alternatives considered

- **Wikipedia-only scraper first** — rejected: explicitly disallowed by the
  product thesis; Wikipedia must prove the generic path works, not be a
  special case.
- **Per-site adapters for every supported site** — rejected: does not scale,
  duplicates general-extraction logic, and hides regressions in the generic
  path behind site-specific code.
- **No sentinel step; run general extraction directly on the DOM including
  code** — rejected: general extractors routinely damage code formatting;
  the sentinel step is what lets general extraction and exact code
  preservation coexist.

## Consequences

- A site adapter is added only when fixtures demonstrate a structure the
  generic path cannot handle — never speculatively.
- The detector → sentinel → general-extract → adapter → restore pipeline
  (see `architecture/overview.md`) is the backbone of Phases 4–6.
- Deterministic detector precedence and overlap resolution must be specified
  before Phase 5/6 implementation (tracked for Phase 1 planning).
