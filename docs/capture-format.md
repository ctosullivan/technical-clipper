# Capture bundle format

Implemented as of Phase 7 (`decisions/0016`, `0017`, `0019`, `0028`, `0029`,
`0030`). `assembleBundle(doc, options)` in `@technical-clipper/core` produces
the bundle.

## Layout

```
<slug>/
├── content.md          # rendered Markdown, one profile
├── document.json        # canonical pretty JSON of the DocumentIR
├── manifest.json        # bundle/version/hash/status metadata
├── diagnostics.json     # export status + the full diagnostics array
└── raw/                 # only when raw HTML is included
    ├── page.html        # cloned, sanitized page DOM
    └── README.txt       # what was stripped
```

`<slug>` = slug of the title + the first 8 hex of `documentContentIdentity` —
never the timestamp.

## Markdown (`content.md`)

- One explicit profile per render: `commonmark`, `gfm`, or `obsidian`
  (`decisions/0019`). Default for the Obsidian handoff / bundle is `obsidian`;
  "Copy Markdown" uses `gfm`.
- Every fenced code block preserves the exact `CodeBlockIR.text` bytes; the
  fence character/length is chosen by the `decisions/0016` algorithm and the
  renderer re-parses each fence to verify byte equality (`TC-RENDER-CODE-MISMATCH`
  is fatal).
- Where a profile lacks a construct, the renderer degrades per the
  `decisions/0030` table and emits `TC-RENDER-DEGRADE`.
- Raw page HTML is **never** emitted as markup — `htmlBlock` becomes a fenced
  `html` block, `rawInlineHtml` becomes escaped text (`decisions/0028`).
- The `obsidian` profile prepends YAML frontmatter (`title`, `source_url`,
  `canonical_url`, `author`, `published`, `captured`, `extractor_version`,
  `export_status`, `capture_kind`, plus any ClipSpec frontmatter). Because it
  includes `captured:`, the `obsidian` `content.md` is not byte-identical
  across two captures of the same content; the `gfm`/`commonmark` renders are.

## Canonical JSON

`decisions/0016`: UTF-8, LF newlines, keys sorted by Unicode code point,
`undefined` omitted. The **compact** form is what hashes cover; the on-disk
files are the **pretty** form (2-space indent, one trailing LF), a
deterministic function of the compact form.

## Hashing (SHA-256, lowercase hex)

| hash                                      | covers                                                                                                                                                               |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contentIdentity.documentContentIdentity` | canonical compact JSON of the `DocumentIR` with `source.captureTimestamp` and `pageLoadState.observedAt` removed — the **universal, timestamp-independent identity** |
| `contentIdentity.markdown`                | exact bytes of `content.md` (this render)                                                                                                                            |
| `contentIdentity.rawPageHtml`             | exact bytes of `raw/page.html`, or `null`                                                                                                                            |
| `contentIdentity.blocks[nodeId]`          | per code block: SHA-256 of the exact code bytes; per message: SHA-256 of the message's canonical JSON                                                                |

## Identity vs. event metadata

`manifest.json` separates `contentIdentity` (hashes) from `event`
(`timestamp`, `sourceUrl`, `canonicalUrl`, `captureScope`, `pageLoadState`).
Two captures of identical page content produce **identical
`documentContentIdentity`, identical `gfm`/`commonmark` `content.md`, identical
per-block hashes**, and a **different `manifest.json`** (it embeds the
timestamp) — so the whole ZIP differs. **Content-hash identity is promised;
whole-bundle byte identity is not** (`decisions/0017`).

## ZIP determinism

`decisions/0029`: STORE only (no compression), entries in lexicographic path
order, every entry timestamped `1980-01-01`, files `0644`. Two archives built
from byte-identical entries are byte-identical.

## Raw HTML inclusion

`article` / `technical_article`: default **on** (user-selectable).
`conversation`: default **off** (a ChatGPT page carries other-branch fragments
and personal data — the user opts in per capture). When included, the pipeline
serializes the cloned DOM with `<script>` / `<style>` / `on*` attributes and
non-selected-branch subtrees removed; `raw/README.txt` lists the categories.

## Completeness report

`evaluateCapture(doc)` (`decisions/0015`, `0031`) returns a
`CompletenessReport`: `status`, `reason`, `canExport`,
`requiresVisibleWarning`, `counts` by severity, `code`
(`detected / exact / normalized / approximate / failed`), `citations`
(`total / resolved`), `sections` (`expected / kept` — only when an expected
outline is available), `warnings` (human capture-scope lines), and the ordered
`diagnostics`. `capture()` returns it on `result.report`; the extension shows
it before export and the bundle's `manifest.json` `diagnosticsSummary` is
derived from `counts`.

## Export gate

The extension may present copy / Obsidian / download only when
`exportStatus !== 'failed'`. For `partial`, `requiresVisibleWarning` is set and
the completeness report must be shown; `diagnostics.json` records the same
array either way (`decisions/0015`).
