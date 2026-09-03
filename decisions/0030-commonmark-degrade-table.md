# 0030. Deterministic profile-degrade table

## Status

Accepted (Phase 7).

## Context

`decisions/0019` requires that when a Markdown profile lacks a construct the IR
needs, the renderer "degrades deterministically … and emits an `info`
diagnostic … It never emits a higher-profile construct." This ADR fixes the
exact degrade for each construct.

## Decision

`packages/core/src/render/markdown.ts`, guided by
`PROFILE_CAPABILITIES` (`render/profiles.ts`):

| IR construct                       | `obsidian`                                                | `gfm`                                                                                           | `commonmark`                                                                      |
| ---------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| table                              | GFM pipe table                                            | GFM pipe table                                                                                  | **degrade**: one loose bullet per row, cells as `**Header:** value` joined by `·` |
| strikethrough                      | `~~x~~`                                                   | `~~x~~`                                                                                         | **degrade**: emit the inner text unwrapped                                        |
| task-list item                     | `- [x]` / `- [ ]`                                         | `- [x]` / `- [ ]`                                                                               | **degrade**: `- ☑ ` / `- ☐ ` literal prefix                                       |
| callout (blockquote marked as one) | `> [!type] Title` + `> ` body                             | **degrade**: plain `> ` blockquote, first line `**Title**`                                      | same as gfm                                                                       |
| YAML frontmatter                   | emitted                                                   | **not emitted** (no `info` — frontmatter is additive metadata, not a degrade of a content node) | not emitted                                                                       |
| highlighted-line spec on a fence   | ` ```lang {1,3-5} `                                       | ` ```lang {1,3-5} `                                                                             | **omit** the spec (info string carries language only)                             |
| math block with TeX                | `$$ … $$`                                                 | `$$ … $$` + `info` (portability not guaranteed)                                                 | `$$ … $$` + `info`                                                                |
| `htmlBlock` / `rawInlineHtml`      | fenced `html` / escaped text + `TC-RENDER-HTML-SANITIZED` | same                                                                                            | same                                                                              |

Each **degrade** row emits `TC-RENDER-DEGRADE` (`info`) once per construct
kind per document. A degrade never emits a construct from a higher profile,
and never drops the node.

Links are unaffected by profile: always `[label](absolute-url)` in every
profile (`decisions/0019` — the MVP never emits a wikilink for source
content).

## Alternatives considered

- **Emit an HTML `<table>` in `commonmark`** — rejected: `decisions/0028` keeps
  raw HTML out of `content.md`; a bullet list is portable and lossless for
  reading.
- **Silently drop task-list checkboxes in `commonmark`** — rejected by § 9
  anti-patterns (silent loss); the `☑`/`☐` prefix preserves the information.
- **No `info` diagnostic on degrade** — rejected by `decisions/0019`.

## Consequences

- The degrade behaviour is pinned by the per-fixture `expected.commonmark.md` /
  `expected.gfm.md` / `expected.md` goldens.
- Adding a construct means adding a row here + regenerating the profile
  goldens.
