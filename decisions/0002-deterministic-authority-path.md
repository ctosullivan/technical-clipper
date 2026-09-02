# 0002. Deterministic authority path for capture/extraction behaviour

## Status

Accepted

## Context

AI assistance (this project is built with the help of coding agents, and may
later use AI to _propose_ extraction adapters or ClipSpec patches) is
valuable for drafting, but the product's central claim is deterministic,
reproducible extraction. If AI output could directly alter capture or
production extraction behaviour, the product would silently stop being
deterministic and its fidelity claims would become unverifiable.

## Decision

AI may propose adapters or ClipSpec patches. AI output must never directly
alter a capture or production extraction behaviour. Only reviewed, versioned
rules with passing fixtures may do that. This applies at runtime (no AI
inference in the extraction pipeline) and at development time (an AI-authored
adapter change lands only through the normal review/fixture process, same as
a human-authored one).

## Alternatives considered

- **AI-in-the-loop extraction** (an LLM interprets ambiguous DOM structure at
  capture time) — rejected: breaks determinism/reproducibility (constraint
  set in `decisions/0006`), and is explicitly out of MVP scope.
- **Automatic AI-authored adapter merges** — rejected: removes the human
  review step that keeps adapters accountable to fixtures.

## Consequences

- The `.claude/skills/markdown-clipping` skill (Phase 2) is development-time
  guidance only, never a runtime dependency, and never authority to change
  behaviour on its own — stated explicitly in `CLAUDE.md`.
- Every adapter/detector change needs a passing fixture, per `AGENTS.md` §
  definition of done.
- "Automatic schema/adapter updates" remains a listed non-goal unless a new
  ADR explicitly changes this boundary.
