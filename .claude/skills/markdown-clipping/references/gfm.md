# GitHub Flavored Markdown extensions (profile: `gfm`)

Derived notes from the **GFM spec v0.29-gfm (2019-04-06)**,
<https://github.github.com/gfm/>. `gfm` = CommonMark 0.31.2 (see
`references/commonmark.md`) **plus** the five extensions below. Retrieval and
hashes: `references/source-register.md`.

## Tables (§4.10)

<!-- verify: table -->

```
| Header A | Header B |
| --- | :---: |
| a1 | b1 |
```

Rules the renderer must obey:

- A table is a **header row**, a **delimiter row**, then zero or more data
  rows. Leading/trailing pipes optional — the renderer **always emits them**
  for clarity and to avoid ambiguity.
- Delimiter row: hyphens per column, optional leading/trailing colon for
  alignment — `:---` left, `---:` right, `:---:` center, `---` default. The
  renderer emits the alignment carried by `TableIR`.
- **Cell content is inline only.** No block-level content in a cell. A
  paragraph break, list, or fenced code block cannot appear in a cell — if
  `TableIR` somehow carries one, that is a builder bug; the renderer emits the
  cell's text and raises a diagnostic.
- **Escaping inside a cell**: a literal `|` is written `\|`. This applies
  **even inside a code span in a cell** — `` `a\|b` `` — because the table
  parser runs first. The renderer escapes every `|` in cell text and in cell
  code spans.
- A hard line break inside a cell is not representable — the renderer replaces
  an intra-cell soft/hard break with a single space and emits an `info`
  diagnostic (`decisions/0019` degrade).
- Column-count mismatch: extra cells are dropped, missing cells are empty. The
  renderer pads/truncates to the header column count deterministically.

**`commonmark` degrade**: a `table` node becomes a loose bulleted list, one
item per row, each item `**HeaderA:** cell · **HeaderB:** cell` — plus an
`info` diagnostic. Never emit a pipe table in `commonmark`.

## Task list items (§5.3)

<!-- verify: task-list -->

`- [ ] todo` / `- [x] done` — the `[ ]`/`[x]` comes **immediately after** the
list marker and its space, then a space, then inline content. `[X]` is legal;
the renderer emits lowercase `[x]`.

**`commonmark` degrade**: emit `- ` + `☐ ` / `☑ ` prefix as literal text, plus
an `info` diagnostic.

## Strikethrough (§6.5)

<!-- verify: strikethrough -->

`~~text~~` (two tildes; one-tilde is accepted by GitHub but the renderer emits
two for portability within GFM). Cannot span a blank line. A literal `~~` in
prose that is not strikethrough is escaped `\~\~`.

**`commonmark` degrade**: emit the inner text unwrapped, plus an `info`
diagnostic (there is no portable strikethrough).

## Autolinks — extension (§6.9)

Bare URLs are linked: `http://`, `https://`, `www.` (rendered with an implied
`http://`), and email addresses. GitHub trims trailing punctuation
(`. , : ; ! ? ) ` etc.) and unbalanced closing parens from the matched URL.

The renderer does **not** rely on autolinking — it always emits explicit
`[label](url)` links from `link` IR nodes, so destination and label stay
exact. Bare text that merely _looks_ like a URL is left as text.

## Disallowed raw HTML (§6.11)

GFM filters a specific tag set (`<title>`, `<textarea>`, `<style>`, `<xmp>`,
`<iframe>`, `<noembed>`, `<noframes>`, `<script>`, `<plaintext>`) by escaping
the leading `<`. The renderer's allowlist sanitizer (`decisions/0019`) is
**stricter** than this and runs in every profile — treat GFM's list as a floor,
not the policy.
