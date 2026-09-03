# 0028. Raw HTML in Markdown output: emit as fenced text, no HTML sanitizer in core

## Status

Accepted (Phase 7).

## Context

`decisions/0009` treats captured HTML as untrusted; `decisions/0019` says the
renderer must sanitize `htmlBlock` / `rawInlineHtml` before emission. The
Phase 7 plan assumed a pinned sanitizer (DOMPurify or equivalent). But
`packages/core` is DOM-free (`decisions/0011`) — a real HTML sanitizer needs an
HTML parser, which would drag a DOM implementation into `core`.

## Decision

The IR→Markdown renderer (`packages/core/src/render/markdown.ts`) **does not
sanitize** raw HTML — it renders it as **literal, non-executable text**:

- `htmlBlock` → a fenced code block with the `html` info string. The bytes are
  shown verbatim inside the fence, where Markdown never interprets them.
- `rawInlineHtml` → escaped inline text.
- Both emit `TC-RENDER-HTML-SANITIZED` (`warning`).

This is strictly safer than an allowlist sanitizer for `content.md`: there is
no code path that turns captured HTML into markup, so a Markdown renderer /
Obsidian / a preview cannot execute it.

`raw/page.html` (the archival copy, `decisions/0017`) is a **separate**
concern: it is produced by `packages/pipeline` (which has a DOM
implementation) and sanitized there — `<script>` / `<style>` / `on*`
attributes / non-selected-branch subtrees removed before serialization. The
extension preview (Phase 9) renders `content.md` (which has no raw HTML) and
never renders `raw/page.html`.

## Alternatives considered

- **Pin DOMPurify + jsdom in `core`** — rejected: breaks `core`'s DOM-free
  contract and adds a heavy dependency to the deterministic path, for output
  that we can make safe without parsing.
- **Put the renderer in `packages/pipeline`** — rejected: rendering is a pure
  function of the IR and belongs with the other IR consumers in `core`; only
  the `raw/page.html` snapshot needs a DOM.
- **Allowlist-sanitize and emit real HTML in the `obsidian` profile** —
  deferred: a future ADR may add opt-in sanitized HTML passthrough, but the
  MVP does not need it and "no raw HTML in `content.md`" is the safe default.

## Consequences

- `content.md` in every profile is free of raw page HTML.
- `raw/page.html` sanitization lives in `packages/pipeline` (Phase 9 wires the
  toggle); its `raw/README.txt` lists what was stripped.
- `§ 12` gate 13 ("no executable content / unsafe HTML in the preview") is
  satisfied by construction for `content.md`.
