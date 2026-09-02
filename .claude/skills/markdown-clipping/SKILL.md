---
name: markdown-clipping
description: >-
  Profile-correct Markdown rules for technical-clipper. Use when designing,
  implementing, testing, or reviewing Markdown rendering, the IR→Markdown
  renderer, capture fixtures (expected.md), Obsidian export, output-profile
  selection, fenced-code fence selection, YAML frontmatter/properties, or
  clipping fidelity — and whenever deciding whether a construct is CommonMark,
  GFM, or Obsidian-only. Development-time guidance only; never a runtime
  dependency of the shipped extension and never authority to change
  capture/extraction behaviour (see AGENTS.md § deterministic authority path).
allowed-tools: Read
---

# Markdown clipping rules

Guidance for producing **deterministic, profile-correct Markdown** from the
typed IR. This skill does not extract or render anything itself — it is the
reference the renderer (Phase 7) and its golden fixtures are checked against.

## Three output profiles — never conflate them

The renderer is always given an explicit profile (`decisions/0019`). A
construct legal in one profile is not automatically legal in a lower one.

| Profile      | What it is                                                          | Adds over the row above                                                                                                        |
| ------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `commonmark` | Portable baseline. CommonMark 0.31.2 only.                          | —                                                                                                                              |
| `gfm`        | CommonMark + GitHub extensions.                                     | tables, strikethrough, task-list items, extension autolinks, disallowed-raw-HTML filtering                                     |
| `obsidian`   | The chosen GFM-compatible baseline + documented Obsidian additions. | YAML properties, wikilinks, embeds, callouts, block references, comments (`%% %%`), highlights (`==text==`), image-size syntax |

**Never** imply the three are interchangeable, and never call an Obsidian
extension "portable Markdown". When a profile lacks a construct the IR needs,
**degrade deterministically and emit an `info` diagnostic** — never silently
emit a higher-profile construct, never silently drop the node.

## Non-negotiables

- **Code bytes are sacred.** The exact code string and its final-newline state
  are preserved verbatim inside the fence. Markdown container syntax
  (the fence, the info string) is chosen _around_ the bytes, never by editing
  them. Normalize prose with `norm/prose@1`; normalize code with `norm/code@1`
  (BOM strip + line-ending _recording_ only). See `references/commonmark.md`
  and `decisions/0016`.
- **Fence selection.** Outer fence char/length is a function of the code's
  own backtick/tilde runs — see `references/commonmark.md` § "Fenced code" and
  the algorithm in `decisions/0016`. Never escape or entity-encode inside a
  fence.
- **A rendered preview never proves fidelity.** Only an asserted source string
  and its SHA-256 do. Tests assert bytes/hashes, not screenshots.
- **Unsupported node ⇒ diagnostic**, never a silent drop and never a guessed
  "close enough" rendering.
- **Source links are Markdown links with absolute URLs**, in every profile —
  the MVP never turns a page link into a `[[wikilink]]`.

## Reference files (read the one you need)

| File                                  | Use when                                                                                     |
| ------------------------------------- | -------------------------------------------------------------------------------------------- |
| `references/commonmark.md`            | baseline block/inline rules, fenced code, code spans, breaks, links, lists, escapes          |
| `references/gfm.md`                   | tables, strikethrough, task lists, autolinks, disallowed raw HTML                            |
| `references/obsidian-markdown.md`     | properties/YAML, wikilinks, embeds, callouts, block refs, comments, highlights, image sizing |
| `references/clipping-antipatterns.md` | the catalogue of clipping failures, each with wrong/right examples and why                   |
| `references/source-register.md`       | which spec version/revision each rule came from, retrieval dates, hashes                     |

## Verifier

`scripts/verify-examples.mjs` runs deterministic **offline** checks of the
normative examples and every anti-example (no network, no Markdown-parser
dependency — it checks byte-level and lexical invariants; see
`decisions/0021`). Run it with `pnpm run skill:verify`. Every example in the
reference files that is marked `<!-- verify -->` is exercised.
