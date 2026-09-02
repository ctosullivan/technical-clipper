# CommonMark baseline (profile: `commonmark`)

Derived notes from the **CommonMark spec v0.31.2 (2024-01-28)**,
<https://spec.commonmark.org/0.31.2/>. Spec text is CC BY-SA 4.0 (John
MacFarlane). Retrieval and hashes: `references/source-register.md`. This is a
derived summary, not a copy — consult the spec for edge cases.

## Blocks vs inlines

Block structure is parsed first (headings, paragraphs, lists, block quotes,
code blocks, thematic breaks, HTML blocks), then inline content inside each
leaf block (text, emphasis, links, code spans, …). The IR mirrors this: block
nodes carry inline children; the renderer emits block containers and walks
inlines within.

## Blank lines and paragraphs

A paragraph is one or more lines of inline text separated from other blocks by
blank lines. Blank lines between blocks are structural — the renderer emits
**exactly one** blank line between sibling block nodes (deterministic), never
zero and never two.

## Line breaks

- **Soft break** (`lineBreak` with `hard: false`): rendered as a single `\n`
  inside the paragraph; collapses to a space when displayed.
- **Hard break** (`hard: true`): rendered as a backslash `\` followed by
  `\n`. (Two-trailing-spaces is the other legal form but is invisible in
  source and error-prone — always use the backslash form.)

## Headings

- **ATX**: 1–6 unescaped `#`, then a space, then inline content. No closing
  `#` sequence (legal but noise). The renderer always emits ATX.
- **Setext** (`=`/`-` underline) is legal but never emitted — it can only
  express levels 1–2 and interacts with thematic breaks.

## Thematic break

`---` on its own line (three or more `-`). The renderer emits exactly `---`.
Watch the anti-pattern: a paragraph of text immediately followed by a line of
`---` is parsed as a **setext heading**, not text + thematic break. Guard by
keeping the blank line the IR already implies between blocks.

## Indented vs fenced code blocks

Indented code blocks (4-space) are **never** emitted — they cannot carry a
language and swallow leading whitespace. All code is fenced.

## Fenced code — the rules that matter for exact preservation

<!-- verify: fenced-code -->

- Opening fence: **≥ 3** backticks (`` ` ``) **or** **≥ 3** tildes (`~`),
  indented 0–3 spaces (we always emit 0).
- Closing fence: **same character**, **at least as long** as the opening,
  nothing but trailing whitespace after it.
- The **info string** follows the opening fence. **A backtick fence's info
  string may not contain a backtick.** (Tilde fences may.)
- Fence content is **literal** — not parsed as Markdown, not
  entity-decoded, backslash escapes do **not** apply. So the exact code bytes
  survive with zero transformation, provided the fence is long enough.

**Fence selection algorithm** (`decisions/0016`, implemented in
`packages/core/src/fence.ts` in Phase 3; mirrored in
`scripts/verify-examples.mjs`):

1. `B` = longest run of consecutive backticks in the code; `T` = longest run
   of tildes.
2. Fence char = backtick, **unless** `B > 0 && T === 0` and the info string
   contains no tilde → then tilde (a backtick run in the code with no tildes
   to worry about is the one case where a plain `~~~` fence is cleaner).
3. Fence length = (longest run of the **chosen** char in the code) + 1,
   minimum 3.
4. Never alter bytes inside the fence. If exact bytes still can't be
   represented (should be impossible after steps 1–3) → fatal
   `TC-RENDER-FENCE`.

Examples (` ` = space):

| code contains                          | outer fence                                                              |
| -------------------------------------- | ------------------------------------------------------------------------ |
| no backticks or tildes                 | ` ``` ` (3 backticks)                                                    |
| a backtick run, no tildes              | `~~~` (tildes; length 3)                                                 |
| a 4-backtick run **and** a 5-tilde run | ` ````` ` (5 backticks: stays backticks because `T ≠ 0`; length = 4 + 1) |
| only tildes in the code                | ` ``` ` (stays backticks; length 3)                                      |

## Code spans (inline)

<!-- verify: code-span -->

A backtick string of length **N** is closed by the next backtick string of
**exactly** length N. If the content both begins and ends with a space and is
not all spaces, one space is stripped from each end on render — so to embed a
string that starts/ends with a backtick, pad with a space: `` ` ``code`` ` ``.
The renderer chooses N = (longest backtick run in the span text) + 1, and adds
the single-space padding when the text starts or ends with a backtick.

## Block quotes

`> ` prefix on **every** line of the quoted content, including blank lines
between nested blocks (`>` with no trailing space). Dropping the prefix on a
continuation line breaks the quote.

## Lists

- Bullet marker: the renderer emits `- ` for unordered, `1.` `2.` … for
  ordered (actual counting, not all `1.`).
- **Nested** list items are indented so the marker of the child aligns past
  the text start of the parent (`- ` → 2 spaces; `1. ` → 3 spaces). Every
  continuation line of an item carries that indentation.
- **Tight vs loose**: a list is loose if any item is separated by a blank
  line or contains multiple block children. The IR's `list.tight` flag
  decides; the renderer inserts blank lines between items only when loose.
- A line that could start a list/heading/quote/thematic-break inside prose
  (`- `, `# `, `> `, `1. `) is backslash-escaped at the start of the text run
  when it is _not_ meant as that construct.

## Links and images

- Inline form only: `[label](destination "optional title")`.
- **Destination**: absolute URL. If it contains spaces or control chars, wrap
  in `<...>`. Parentheses in a bare destination must be balanced or
  backslash-escaped.
- **Label**: inline content; a literal `]` inside is backslash-escaped;
  nested unescaped `[` `]` break the link.
- **Title**: prefer `"..."`; a literal `"` inside is backslash-escaped.
- Image: `![alt](url)`. Alt text is plain text (no inline markup emitted).

## Autolinks (baseline)

`<https://example.com>` and `<user@example.com>` only. Bare-URL autolinking is
a **GFM** extension — not emitted in `commonmark`.

## Entity and numeric references

`&amp;` `&#123;` `&#x1F;` are recognized in text and decode on render. The
renderer emits literal characters and escapes only what must be escaped (see
below); it does not emit entities except where a literal would be misparsed.

## Backslash escapes

A backslash before an ASCII punctuation character escapes it. Backslash before
any other character is literal. The renderer escapes, in **text** runs only:
``\ ` * _ { } [ ] ( ) # + - . ! | < > ~`` when the character would otherwise
start or participate in a construct at that position. It **never** escapes
inside code spans or fenced code.

## Raw HTML

CommonMark passes HTML blocks/inline HTML through. The renderer stores raw
HTML in `htmlBlock` / `rawInlineHtml` nodes and emits it **only after
allowlist sanitization** (`decisions/0019`); an unsanitized `<script>` etc. is
removed and a diagnostic emitted.
