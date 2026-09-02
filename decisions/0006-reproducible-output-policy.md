# 0006. Reproducible output policy

## Status

Accepted

## Context

A deterministic web document compiler is only trustworthy if "deterministic"
is a checkable property, not a vibe. Without an explicit policy, JSON key
ordering, whitespace normalization, hash input boundaries, and ZIP metadata
(timestamps, entry order, permissions) can all vary run-to-run for identical
input, silently breaking any byte-for-byte reproducibility claim.

## Decision

Wherever byte-for-byte reproducibility is claimed, the following are
required and must be documented precisely: canonical JSON ordering,
documented normalization rules, stable SHA-256 hashes with a specified input
boundary (raw vs. normalized), deterministic Markdown output, deterministic
ZIP entry ordering, and normalized ZIP metadata (fixed timestamps/
permissions rather than wall-clock values). The repository must not promise
whole-bundle byte identity while embedding a changing capture timestamp
unless the format explicitly separates content identity from event metadata.

## Alternatives considered

- **"Deterministic" as an informal goal, verified only by eyeballing diffs**
  — rejected: not checkable, will regress silently.
- **Hash the whole bundle including timestamps as the sole identity check**
  — rejected: conflates content identity with capture-event metadata; two
  captures of identical content at different times would then never match,
  which contradicts the fixture/regression-testing need for stable hashes.

## Consequences

- `packages/core` owns the canonical normalization/hashing implementation;
  every renderer consumes it rather than reimplementing.
- The capture bundle format (`docs/capture-format.md`) must explicitly state
  which bytes each hash covers and whether whole-bundle byte identity or
  only content-hash identity is promised.
- MVP release gates require deterministic IR and Markdown for identical
  normalized input (`planning/v0-to-mvp-planning-prompt.md` § 12).
