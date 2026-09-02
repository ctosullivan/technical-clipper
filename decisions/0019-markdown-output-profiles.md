# 0019. Markdown output profile selection

## Status

Accepted (Phase 1 planning). Skill guidance in Phase 2; renderer in Phase 7.

## Context

§ 9 requires the renderer to always select an explicit output profile and never
imply that CommonMark, GFM, and Obsidian Markdown are interchangeable. The
Phase 2 skill is the _syntax_ authority; this ADR fixes the _selection
contract_ the renderer and extension obey.

## Decision

### Profiles

`commonmark` | `gfm` | `obsidian`. The renderer entry point **requires** a
profile argument; there is no default inside `packages/core`.

### Capability matrix (summary; Phase 2 skill holds the detail)

| feature                                                       | commonmark  | gfm | obsidian |
| ------------------------------------------------------------- | :---------: | :-: | :------: |
| headings, lists, blockquotes, fenced code, links, images      |      ✓      |  ✓  |    ✓     |
| tables, strikethrough, task-list items, autolinks             | ✗ (degrade) |  ✓  |    ✓     |
| YAML frontmatter / properties                                 |      ✗      |  ✗  |    ✓     |
| callouts, wikilinks, embeds, block refs, comments, highlights |      ✗      |  ✗  |    ✓     |

Where a profile lacks a feature the IR needs (e.g. a `table` in `commonmark`),
the renderer degrades deterministically (a `commonmark` table becomes a
bulleted list of `header: cell` lines) **and** emits an `info` diagnostic
recording the degrade. It never emits a higher-profile construct.

### Selection

- Extension "Copy Markdown" → `gfm`.
- Extension "Send to Obsidian" / bundle default → `obsidian`.
- `commonmark` is available via an explicit UI choice and via ClipSpec
  `markdownProfile`.
- ClipSpec `markdownProfile` overrides the per-action default; an explicit user
  toggle overrides the ClipSpec (`0018`).

### Links — no accidental wikilinks

Source-page links are **always** rendered as normal Markdown links with
resolved absolute destinations, in every profile. The MVP never converts a
source link into a `[[wikilink]]`. Wikilink syntax appears only inside
`obsidian`-profile frontmatter values when a property is explicitly configured
to hold one (quoted), per the Phase 2 property rules.

### Frontmatter (obsidian profile)

Keys, all optional, unique, typed, safely quoted, no Markdown in values,
timestamps as quoted ISO-8601 strings:
`title`, `source_url`, `canonical_url`, `author`, `published`, `captured`,
`extractor_version`, `export_status`, `capture_kind`, `tags` (list).
Values come from `SourceMetadata` + export status; nothing inferred.

### Preview safety

The extension preview renders the **same profile string** the user will
export, through a sanitizing Markdown renderer; raw/page-supplied HTML in
`htmlBlock`/`rawInlineHtml` nodes is sanitized (allowlist) before display and
before it reaches `content.md`. A rendered preview is never cited as proof of
code fidelity (§ 12) — the completeness report shows asserted hashes.

## Alternatives considered

- **Single "Obsidian-ish" output** — rejected by § 9; portability claims would
  be false.
- **Default profile constant in core** — rejected: the caller's context (copy
  vs. vault) determines the right profile; a hidden default invites the wrong
  one.
- **Emit wikilinks for same-site links** — rejected: the destination is a web
  URL, not a vault note; § 9 anti-patterns forbid confusing the two.

## Consequences

- Phase 7 renderer is three profile configs over one IR walker, plus the
  degrade table.
- Phase 2 skill's `obsidian-markdown.md` / `gfm.md` / `commonmark.md` are the
  normative syntax references the renderer's golden fixtures are checked
  against.
- Release gate "exported Markdown renders acceptably in a test Obsidian vault"
  tests the `obsidian` profile output specifically.
