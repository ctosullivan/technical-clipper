# Obsidian Markdown additions (profile: `obsidian`)

Derived notes from the Obsidian Help site (retrieved 2026-09-03;
`help.obsidian.md/*` now redirects to `obsidian.md/help/*`). Pages:
`/help/syntax`, `/help/advanced-syntax`, `/help/properties`, `/help/links`,
`/help/embeds`, `/help/callouts`. Retrieval and hashes:
`references/source-register.md`.

`obsidian` = the GFM-compatible baseline (`references/gfm.md`) **plus** the
additions below. Everything here is **Obsidian-only** — it must never appear
in `commonmark` or `gfm` output.

## YAML properties / frontmatter

<!-- verify: properties -->

A single YAML block **at the very top of the file**, fenced by `---` lines,
before any content.

- **Keys are unique.** Never emit a duplicate key (Obsidian: "you can't have
  more than one tags property").
- **Values are atomic or lists — no Markdown, no nesting.** "Markdown
  formatting is not rendered in text properties … properties are meant for
  small, atomic bits of information." Do not put `**bold**`, links, or
  multi-line strings in a value.
- **Types and serialization:**
  - text → plain scalar; quote with `"..."` if the value could be misread as
    YAML (leading `@ ! & * ? | > % # : -`, leading/trailing space, `true`/
    `false`/`null`/`yes`/`no`/`on`/`off` casings, anything numeric-looking
    that must stay a string, or containing `: ` or `#`).
  - list → block sequence, `- item` per line.
  - number → bare literal number (no operators/units).
  - checkbox → `true` / `false`.
  - date → `YYYY-MM-DD`; datetime → `YYYY-MM-DDTHH:MM:SS`. **Always quote**
    these when the intent is a string label rather than a typed date, so the
    type is not silently changed.
- **Links in a value must be quoted wikilinks**: `source: "[[Note name]]"`.
  The MVP does not emit wikilinks (see below), so `source_url` etc. are plain
  quoted URL strings, not wikilinks.
- Default list-typed keys: `tags`, `aliases`, `cssclasses`.

Renderer frontmatter key set (`decisions/0019`), all optional:
`title`, `source_url`, `canonical_url`, `author`, `published`, `captured`,
`extractor_version`, `export_status`, `capture_kind`, `tags`.

## Wikilinks

`[[Note name]]`, `[[Note name|alias]]`, `[[Note name#Heading]]`,
`[[Note name#Sub#Sub]]`, `[[Note name#^blockid]]`. Characters that break a
wikilink target: `# | ^ : [[ ]] %%`.

**The MVP never emits a wikilink for source content.** A captured page link is
always `[label](https://absolute-url)` — it points at the web, not a vault
note (`decisions/0019`, anti-patterns § "source link vs wikilink"). Wikilink
syntax may appear only inside a quoted property value if a future ClipSpec
explicitly configures one.

## Embeds

`![[file]]`, `![[note#Heading]]`, `![[note#^blockid]]`,
`![[image.png|100]]` (width), `![[image.png|100x145]]` (w×h). External image
width: `![100](https://example.com/x.png)`.

The MVP does not mirror or embed remote assets (non-goal) — remote images are
emitted as standard `![alt](absolute-url)` links, **not** embeds. Embeds would
only apply to vault-local files the MVP never creates.

## Callouts

<!-- verify: callout -->

```
> [!note] Optional title
> body line
> body line
```

- First line: `> [!TYPE]` then an optional title on the same line. `TYPE` is
  case-insensitive.
- Every body line carries the `> ` prefix — including blank separator lines
  (`>`).
- Foldable: `> [!TYPE]-` (starts collapsed) / `> [!TYPE]+` (starts expanded).
- Nested: add one `>` per level (`> > [!tip]`).
- Built-in types: `note`, `abstract`(`summary`,`tldr`), `info`, `todo`,
  `tip`(`hint`,`important`), `success`(`check`,`done`),
  `question`(`help`,`faq`), `warning`(`caution`,`attention`),
  `failure`(`fail`,`missing`), `danger`(`error`), `bug`, `example`,
  `quote`(`cite`).

The renderer uses a callout only when the IR explicitly marks a blockquote as
a callout (e.g. an adapter recognised an admonition). A plain page blockquote
stays a plain `>` blockquote in every profile.

**`gfm`/`commonmark` degrade**: a callout becomes a normal blockquote whose
first line is `**TITLE**` (or `**Note**` if untitled), plus an `info`
diagnostic.

## Comments

`%% not rendered %%` (inline or on its own lines). The renderer emits a
comment only for internal notes it is explicitly asked to include (e.g. an
"inferred semantics" marker per the anti-pattern rule). Never emit `%% %%` in
`gfm`/`commonmark` — there it would render as literal text.

## Highlight

`==highlighted==`. Obsidian-only. Emitted only from an explicit `highlight`
inline IR node (rare — most pages don't expose semantic highlight). Degrade
to plain text in lower profiles with an `info` diagnostic.

## Block references

`^blockid` at the end of a block defines an anchor; `[[note#^blockid]]`
targets it. Obsidian-only and not portable. The MVP does not emit block-ref
anchors in shipped Markdown (they are noise in an exported note); node ids
(`decisions/0014`) are used internally instead.

## Math

`$inline$` and `$$block$$` (MathJax). Emitted only from `mathBlock` /
inline-math IR nodes that carry a recovered TeX source. No TeX source ⇒
`approximate` diagnostic, not a guess. Math is **not** portable — in
`commonmark`/`gfm` it is emitted verbatim between `$`/`$$` with an `info`
diagnostic that portability is not guaranteed.

## Strict line breaks

Obsidian has a "Strict line breaks" setting. The renderer does not depend on
the reader's setting: a hard break is the backslash form
(`references/commonmark.md` § "Line breaks"), which is unambiguous in both
modes.
