# Source register

Provenance for every rule in this skill's reference notes. The notes are
**derived summaries**, not copies of the specifications (`AGENTS.md` /
`planning/v0-to-mvp-planning-prompt.md` § 9). Consult the primary source for
edge cases.

## Retrieved sources

| Source                                | Canonical URL                                                                                    | Version / revision exposed                              | Retrieved  | Licence                                                                        | Sections used                                                                                                                                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CommonMark specification              | <https://spec.commonmark.org/0.31.2/> (via `…/current/` redirect)                                | **0.31.2 (2024-01-28)**                                 | 2026-09-03 | CC BY-SA 4.0 (John MacFarlane)                                                 | 3 (blocks/inlines), 4.1 thematic breaks, 4.2–4.3 headings, 4.4–4.5 code blocks, 5.2–5.3 lists, 5.1 block quotes, 6.1 code spans, 6.3–6.4 links, 6.7 hard breaks, backslash escapes, entity refs, raw HTML |
| GitHub Flavored Markdown spec         | <https://github.github.com/gfm/>                                                                 | **0.29-gfm (2019-04-06)**                               | 2026-09-03 | CC BY-SA 4.0 (GitHub, Inc.)                                                    | 4.10 tables, 5.3 task list items, 6.5 strikethrough, 6.9 autolinks (extension), 6.11 disallowed raw HTML                                                                                                  |
| Obsidian — Basic formatting syntax    | <https://obsidian.md/help/syntax> (`help.obsidian.md/syntax` → 301)                              | Help site, no version string; page as of retrieval date | 2026-09-03 | © Obsidian; used as derived reference under fair-use summary, no verbatim copy | headings, emphasis, highlight `==`, strikethrough, internal links, embeds, blockquotes, code, lists, task lists, comments `%%`, footnotes, line breaks                                                    |
| Obsidian — Advanced formatting syntax | <https://obsidian.md/help/advanced-syntax>                                                       | Help site, no version string                            | 2026-09-03 | as above                                                                       | tables (pipe escaping, alignment, cell formatting), Mermaid, math `$`/`$$`                                                                                                                                |
| Obsidian — Properties                 | <https://obsidian.md/help/properties>                                                            | Help site, no version string                            | 2026-09-03 | as above                                                                       | YAML frontmatter location, property types + serialization, unique-key rule, quoted internal links, "no Markdown / no nesting" limitation, default keys                                                    |
| Obsidian — Internal links             | <https://obsidian.md/help/links>                                                                 | Help site, no version string                            | 2026-09-03 | as above                                                                       | `[[ ]]`, alias `\|`, `#heading`, `#^blockid`, Markdown-style `%20` form, link-breaking characters, "block references are Obsidian-only / not portable"                                                    |
| Obsidian — Embed files                | <https://obsidian.md/help/embeds>                                                                | Help site, no version string                            | 2026-09-03 | as above                                                                       | `![[ ]]`, heading/block embeds, image size `\|W` and `\|WxH`, external image `![W](url)`                                                                                                                  |
| Obsidian — Callouts                   | <https://obsidian.md/help/callouts>                                                              | Help site, no version string                            | 2026-09-03 | as above                                                                       | `> [!type]` syntax, foldable `-`/`+`, nesting, built-in type + alias list                                                                                                                                 |
| Claude Code skills documentation      | <https://code.claude.com/docs/en/skills> (`docs.anthropic.com/en/docs/claude-code/skills` → 301) | Live docs as of retrieval date                          | 2026-09-03 | © Anthropic; used for frontmatter schema only                                  | frontmatter fields (`name`, `description`, `when_to_use`, `allowed-tools`), 1,536-char description cap, "keep SKILL.md under 500 lines", directory-name = command                                         |

Notes:

- The Obsidian Help site exposes no spec version or page-revision identifier;
  the retrieval date is the only version anchor. If a rule here is
  contradicted by the live site later, treat it as a documentation bug and
  re-derive (`planning/phase-2-markdown-clipping-skill.md` § stop-and-ask).
- No entire specification is stored in this repository. Only the small
  conformance-style examples needed to remove ambiguity appear, each attributed
  inline.

## Derived-reference hashes (SHA-256, UTF-8, LF)

Recompute after any edit:
`node -e "for(const f of ['commonmark','gfm','obsidian-markdown','clipping-antipatterns']) console.log(f, require('crypto').createHash('sha256').update(require('fs').readFileSync(__dirname+'/'+f+'.md')).digest('hex'))"`
run from this directory.

| File                       | SHA-256                                                            |
| -------------------------- | ------------------------------------------------------------------ |
| `commonmark.md`            | `bd1bf2bd7a1b9cca608fb34ec452542eafebe373e21236da356e06c07e4d56c4` |
| `gfm.md`                   | `98a3c94e6ca4a93a968c9fc79ea1c4a9bd036cd20ec883f3edee408b47682fa3` |
| `obsidian-markdown.md`     | `c4f98e34ba0a30daeb2ab6d672fc85c3d0e1f3c55e274219e12d01ae419920dd` |
| `clipping-antipatterns.md` | `42d27285d8046c3fb315dfe6c1dfd8d4cf3753524ce3cc34d6bacd27b604c325` |

`verify-examples.mjs` asserts each file exists and is non-empty; the hash
table is the tamper-evidence record, refreshed by the Phase 2 completion step
and whenever a reference note changes.
