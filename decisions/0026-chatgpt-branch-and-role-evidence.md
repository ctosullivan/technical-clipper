# 0026. ChatGPT branch and role evidence rules

## Status

Accepted (Phase 6).

## Context

`decisions/0008` fixes the ChatGPT scope: capture only the currently selected,
fully loaded branch — never hidden branches, deleted edits, or internal
reasoning. `planning/v0-to-mvp-planning-prompt.md` § 16 makes it a
stop-and-ask when "ChatGPT DOM access cannot establish message completeness or
roles from stable evidence." Phase 6 must decide exactly which DOM signals are
"stable evidence" and what happens when they are absent.

## Decision

Implemented in `packages/adapters/src/chatgpt.ts`.

### Turn selection

The message turns are the elements matching, in order:
`[data-message-author-role]`, then `[data-testid^="conversation-turn"]`, then
`article[data-turn]` — filtered to the outermost of any nested matches. Only
the turns present in the rendered DOM are captured; the adapter never expands
a collapsed or hidden branch.

### Role evidence (best first)

1. `data-message-author-role` on the turn element or a descendant →
   `user` / `assistant` / `system` / `tool`.
2. `data-testid="conversation-turn-<role>"`.
3. A `user` / `assistant` class token on the turn element.
4. **Structural fallback** — position-only guess, recorded as
   `roleEvidence: "structural fallback (no role marker)"`.

If **no** message in the conversation carries a marker from levels 1–3
(every role is a structural fallback), the adapter emits **fatal**
`TC-ADAPT-BRANCH` — roles could not be established, export is disabled
(`decisions/0015`).

### Branch completeness

- `branchEvidence.branchIndicator` = the first `"N / M"` text found in a
  leaf element (a branch switcher). Its presence is recorded but does **not**
  fail the capture — the visible branch is still the selected one.
- `branchEvidence.notes` states explicitly that only the selected branch was
  captured, never hidden branches.
- `branchEvidence.turnCount` = number of captured turns.

### Streaming

A `.result-streaming` / `[data-streaming="true"]` element, or a button reading
"Stop generating", ⇒ **fatal** `TC-ADAPT-STREAMING` (`decisions/0017`): the
last response is incomplete, export is disabled.

### Attachments

`<img>` / `[data-testid*="attachment"]` / `.attachment` inside a turn →
`AttachmentRef { state: 'not-downloaded', reason }`. Nothing is fetched
(`decisions/0008` non-goals). Generated images and authenticated downloads are
recorded as metadata only.

### Message content

Extracted with a compact message-block walker
(`packages/adapters/src/message-blocks.ts`) that reuses the **standard code
detectors** for any `<pre>` / tab group, so a fenced block in a message gets
the same exact-text guarantee as one in an article. Per-message `hash` =
SHA-256 of the message's canonical JSON (`decisions/0016`).

## Alternatives considered

- **Require `data-message-author-role` on every turn or fail** — rejected as
  too brittle: ChatGPT's DOM changes; the layered evidence with a fatal only
  when _nothing_ is markable is stricter where it matters and resilient where
  it can be.
- **Try to read the branch count and warn if > 1** — kept (the indicator is
  recorded) but not made a failure: the user is looking at one branch and that
  is what "capture this conversation" means.
- **Reconstruct earlier branches from the branch switcher** — rejected by
  `decisions/0008` (hidden content).

## Consequences

- Conversation fixtures (`fixtures/conversations/*`) pin: linear, branch
  switcher, streaming (fatal), and rich content.
- If a future real ChatGPT DOM snapshot cannot be handled by the evidence
  levels above, that is a `decisions/0008` / § 16 stop-and-ask — extend the
  evidence rules via an ADR, do not silently guess.
