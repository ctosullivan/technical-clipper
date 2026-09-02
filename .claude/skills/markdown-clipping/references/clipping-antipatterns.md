# Clipping anti-pattern catalogue

Every failure below is a real way web-clip → Markdown goes wrong. Each has a
wrong form, a right form, and the reason. Cases marked `<!-- verify: NAME -->`
are exercised by `scripts/verify-examples.mjs`.

---

## 1. Wrapping every block in triple backticks

<!-- verify: not-everything-is-code -->

**Wrong:** emitting a paragraph, a table, or a blockquote inside ` ``` `.
**Right:** only `codeBlock` / `codeGroup` / `terminalSession` IR nodes render
as fenced code. Prose renders as prose.
**Why:** fenced content is literal — you destroy links, emphasis, and
structure, and you assert "this is code" about text that isn't.

## 2. Backslash-escaping or entity-encoding inside a fence

<!-- verify: no-escapes-in-fence -->

**Wrong:** ` ```\nconst a = b &amp;&amp; c;\n``` ` or `\<div\>` inside a fence.
**Right:** the bytes go in verbatim: `const a = b && c;`.
**Why:** fence content is not parsed — escaping/encoding changes the code. The
only thing that varies is the **fence** (char + length), never the content.

## 3. Treating block-level code as inline code

<!-- verify: block-not-inline -->

**Wrong:** `` `first line second line` `` for a multi-line block.
**Right:** a fenced block. Inline code spans are for short in-sentence
fragments only and cannot contain a newline.

## 4. Copying line numbers / copy buttons / prompts / token links into source

<!-- verify: no-chrome-in-code -->

**Wrong:** `1  const a = 1;\n2  const b = 2;` or a trailing `Copy` / `$ ` gutter
text captured as code.
**Right:** detectors strip the gutter, the copy button, the language pill, and
prompt decorations before the text reaches `CodeBlockIR` (`decisions` Phase 5).
**Why:** those are UI chrome, not the program.

## 5. Losing final newlines, indentation, blank lines, or code-tab labels

<!-- verify: preserve-code-whitespace -->

**Wrong:** trimming trailing `\n`, collapsing internal blank lines,
re-indenting, or dropping the `"config.ts"` / `"npm"` tab label.
**Right:** `CodeBlockIR.text` is exact; `hasFinalNewline` records the terminal
state; `CodeGroupIR.members[].label` keeps every tab label.

## 6. Flattening tab alternatives / request-response / terminal I/O

<!-- verify: no-flattening -->

**Wrong:** three Docusaurus tabs emitted as three unlabeled consecutive fences;
terminal input and output merged into one block.
**Right:** a `codeGroup` renders as labelled consecutive fenced blocks; a
`terminalSession` renders `input` and `output` as distinct labelled fences.

## 7. Emitting raw / page-supplied HTML into the preview without sanitization

<!-- verify: sanitize-html -->

**Wrong:** passing `<script>…</script>` or `<img onerror=…>` from the page
straight into the preview or `content.md`.
**Right:** `htmlBlock` / `rawInlineHtml` go through the allowlist sanitizer
first; disallowed content is removed and a diagnostic emitted
(`decisions/0019`).

## 8. Using Obsidian-only syntax in the CommonMark or GFM profile

<!-- verify: profile-purity -->

**Wrong:** `==highlight==`, `[[wikilink]]`, `> [!note]`, `%% comment %%`, or a
YAML property block in `commonmark`/`gfm` output.
**Right:** those appear only in `obsidian`. Lower profiles degrade
deterministically with an `info` diagnostic.

## 9. Duplicate / nested / multiline / Markdown-rich properties

<!-- verify: properties-valid -->

**Wrong:** two `tags:` keys; a nested map; `summary: |` with three lines;
`author: **Jane Doe**`.
**Right:** unique keys, atomic or list values, no Markdown, single-line.
**Why:** Obsidian only supports small atomic values; the rest silently
misbehaves.

## 10. Unquoted YAML-sensitive values / retyped timestamps and booleans

<!-- verify: yaml-quoting -->

**Wrong:** `title: Yes` (becomes boolean `true`), `published: 2019-05-01`
when a string label was meant, `source_url: http://x.com: 8080` (colon-space).
**Right:** quote anything ambiguous: `title: "Yes"`,
`published: "2019-05-01"`, `source_url: "http://x.com:8080"`.

## 11. Confusing a source-page link with a vault-internal wikilink

<!-- verify: source-link-not-wikilink -->

**Wrong:** `[[Some Article]]` for a link that pointed at
`https://example.com/some-article`.
**Right:** `[Some Article](https://example.com/some-article)` — in every
profile. The MVP never emits a wikilink for captured content.

## 12. Malformed tables when cells contain pipes or line breaks

<!-- verify: table-pipe-escape -->

**Wrong:** `| a | b|c | d |` (unescaped `|` splits the cell); a literal newline
inside a cell.
**Right:** `| a | b\|c | d |`; intra-cell breaks become a space + `info`
diagnostic. Escape `|` even inside a cell's code span.

## 13. Breaking nested lists / blockquotes / callouts by dropping prefixes

<!-- verify: nested-prefixes -->

**Wrong:** a continuation line of a nested list item at column 0; a callout
body line without `> `.
**Right:** every continuation line carries the parent's indentation; every
callout/blockquote body line carries `> `.

## 14. Turning visual styling into unsupported semantics without recording it

<!-- verify: inferred-semantics-recorded -->

**Wrong:** a bold red `<p>` silently rendered as `> [!danger]`.
**Right:** either keep it as emphasis, or, if an adapter infers an admonition,
render the callout **and** record that the interpretation was inferred
(a `%% inferred: callout from styling %%` comment in `obsidian`, or an `info`
diagnostic in every profile).

## 15. Normalizing prose and code with the same whitespace rules

<!-- verify: prose-vs-code-whitespace -->

**Wrong:** running `norm/prose@1` (collapse spaces, NFC, trim) over code.
**Right:** `norm/prose@1` for prose text; `norm/code@1` for code (BOM strip +
line-ending recording only — no other change). `decisions/0016`.

## 16. Claiming a rendered preview proves byte fidelity

<!-- verify: hash-not-screenshot -->

**Wrong:** "the preview looks right, so the code is exact."
**Right:** assert `CodeBlockIR.text` equals the source string and its SHA-256
matches. The completeness report shows hashes, not screenshots.

## 17. Silently discarding unsupported nodes

<!-- verify: no-silent-drop -->

**Wrong:** an IR node the renderer doesn't handle → omitted.
**Right:** unknown/unsupported node → rendered as a visible fallback **and** a
diagnostic (`warning` or `error` per `decisions/0015`); export status reflects
it.
