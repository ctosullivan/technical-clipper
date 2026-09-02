# 0003. Structured intermediate representation before Markdown

## Status

Accepted

## Context

Converting a page directly to Markdown couples extraction and rendering,
makes it hard to validate captured content before committing to an output
format, and makes it impossible to render multiple profiles (CommonMark,
GFM, Obsidian Markdown) or a structured JSON bundle from a single capture
pass.

## Decision

Do not convert the page directly to Markdown. Capture into a typed
document/conversation IR (`DocumentIR`, `ArticleIR`, `ConversationIR`, and
related node types — settled in detail during Phase 1 planning and
implemented in Phase 3), validate it, and render every output (Markdown in
any profile, `document.json`, diagnostics) from that IR.

## Alternatives considered

- **Direct DOM-to-Markdown transform** — rejected: no validation point, no
  single source of truth for multiple output profiles, harder to attach
  provenance/confidence per node.
- **HTML-to-Markdown library with post-processing** — rejected as the
  primary path: still couples extraction and rendering; may be _used inside_
  an extraction step later, but not as the architecture's backbone.

## Consequences

- Every renderer (Markdown profiles, canonical JSON, capture bundle) is a
  pure function of the IR, never of the live/cloned DOM directly.
- IR validation is a required stage with its own diagnostics, ahead of any
  rendering.
- The exact IR contracts are deferred to Phase 1 planning
  (`planning/v0-to-mvp-planning-prompt.md` § 10) and implemented in Phase 3.
