# 0008. ChatGPT capture scope: currently selected, fully loaded branch only

## Status

Accepted

## Context

A ChatGPT conversation can have multiple edited branches, and the rendered
page does not expose hidden branches, deleted edits, or internal model
reasoning as reliable, stable evidence. Claiming to capture more than what
the rendered DOM exposes would violate the product's evidence-boundary
discipline (see `ai-docs/AGENTS.md`).

## Decision

Capture only the currently selected, fully loaded branch of a ChatGPT
conversation. Do not claim to capture hidden branches, deleted edits,
internal reasoning, or content the UI does not expose.

## Alternatives considered

- **Attempt to reconstruct all branches via API/network calls** — rejected:
  violates the no-network-during-extraction constraint
  (`decisions/0001`) and is out of scope for a DOM-observation-based tool.
- **Silently capture whatever is in the DOM without stating the scope
  limitation** — rejected: would misrepresent completeness; the capture-scope
  warning is a required part of the completeness report
  (`planning/v0-to-mvp-planning-prompt.md` § 3).

## Consequences

- The ChatGPT adapter (Phase 6) must positively verify branch selection and
  message-load completeness before asserting a message is captured, and must
  emit a capture-scope diagnostic otherwise (see `AGENTS.md` § stop-and-ask
  conditions: "ChatGPT DOM access cannot establish message completeness or
  roles from stable evidence").
- `ConversationIR`/`MessageIR` need a way to record capture scope explicitly,
  not just message content.
