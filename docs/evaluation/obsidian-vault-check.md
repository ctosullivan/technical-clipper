# Obsidian vault render check (gate 16)

Gate 16: exported Markdown renders acceptably in a real Obsidian vault. This is
a **manual** gate — the automated checks below establish that the output is
well-formed; a human must confirm the visual result in Obsidian once per release
candidate.

## Automated pre-checks (run offline, all passing)

Verified across all 45 fixture `expected.md` (Obsidian-profile) goldens:

- **YAML frontmatter** is present and parses: `title`, `source_url`,
  `canonical_url`, `captured`, `extractor_version`, `export_status`,
  `capture_kind`. Values with `:` (URLs, timestamps) are quoted where needed.
- **No executable content**: gate 13 renders every fixture through all three
  profiles and asserts no `<script>`, no `on*=` handler, no `javascript:` URL.
- **Fenced code**: every code block uses a fence at least one backtick longer
  than the longest internal backtick run (`decisions/0016`); languages are
  emitted as info strings Obsidian's highlighter accepts.
- **Links**: standard CommonMark `[text](url "title")`. Fragment-only links
  (`#section`) are preserved verbatim.
- **Tables**: GFM pipe tables with a delimiter row; cell contents are escaped
  (`|` → `\|`).
- **Determinism**: re-exporting the same capture produces byte-identical
  Markdown except the `captured:` timestamp (by design, Obsidian profile only).

## Manual checklist (for the release approver, in Obsidian ≥ 1.5)

Import into a scratch vault and confirm:

1. [ ] Frontmatter is recognised as properties, not shown as body text.
2. [ ] Headings, lists (including nested + ordered), and blockquotes render.
3. [ ] Code blocks are highlighted for their language; no line-number or
       "Copy" contamination; backtick-heavy snippets are intact.
4. [ ] Wide tables (`wide-table-reference`, the Wikipedia infoboxes) render or
       scroll without corrupting the page.
5. [ ] Figures show their image and caption; broken/remote images degrade to a
       plain link, not an error.
6. [ ] The `Send to Obsidian` action (`obsidian://new`) creates the note with
       the same content for a capture under 200 KB; a larger capture shows the
       copy/download fallback (`decisions/0033`).
7. [ ] Spot-check the three `comparative/` inputs against the current Obsidian
       Web Clipper and confirm the differences described there still hold.

## Known cosmetic observations (not blockers)

- A `<br>` inside a source table cell renders as a hard-break escape (`\`) mid
  cell — visible as a stray backslash in Obsidian's table view. This mirrors
  the source's own layout choice and does not lose content.
- Some Wikipedia values use non-ASCII hyphens/figure-dashes (e.g. `2026‐246`);
  these are preserved exactly rather than normalised to `-`.

## Status

Automated pre-checks: **PASS**. In-Obsidian visual confirmation: **pending the
release approver** (part of the release-approval step, not done pre-approval).
