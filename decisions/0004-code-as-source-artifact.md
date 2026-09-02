# 0004. Code is a source artifact, with explicit failure over silent approximation

## Status

Accepted

## Context

The product thesis specifically promises exact code preservation. General
article-extraction tooling routinely mangles code blocks (rewrapping,
re-indenting, stripping blank lines, dropping language hints, merging tab
alternatives). If extraction cannot preserve a block exactly, silently
emitting a "close enough" version and calling it exact would violate the
core claim and be worse than refusing.

## Decision

Preserve exact text, indentation, blank lines, language, filename/caption
where exposed, tab-group relationships, extraction method, confidence, and
hashes for every code component. Unsupported or partially accessible
components must produce diagnostics instead — never silently present a
partial block as exact.

## Alternatives considered

- **Best-effort normalization with no confidence tracking** — rejected:
  makes it impossible to distinguish a verified-exact block from a guessed
  one, contradicting the product thesis.
- **Reject the whole capture on any code-extraction failure** — rejected:
  too coarse; a single unsupported block on an otherwise-good article
  shouldn't block export, it should be reported (see `decisions/0006` and
  the export-status levels in `planning/v0-to-mvp-planning-prompt.md` § 10).

## Consequences

- `CodeBlockIR` carries a confidence field (`exact`, `normalized`,
  `approximate`, `failed`) with precise semantics defined in Phase 1
  planning.
- Diagnostics have severity, code, source location, human message, and an
  explicit flag for whether they block export.
- MVP release gates require 100% exact-text preservation across the code
  fixture corpus, and prohibit line-number/copy-button contamination.
