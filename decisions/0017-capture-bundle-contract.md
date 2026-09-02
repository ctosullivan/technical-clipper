# 0017. Capture bundle contract, manifest versioning, and raw-HTML/privacy policy

## Status

Accepted (Phase 1 planning). Implemented in Phase 7.

## Context

§ 11 lists ten questions the bundle design must answer, and § 16 forbids
promising whole-bundle byte identity while embedding a changing timestamp
unless content identity and event metadata are separated. `decisions/0006`
requires deterministic ZIP metadata. `docs/capture-format.md` is a stub waiting
on this ADR.

## Decision

### Layout

```
<capture-slug>/
├── content.md          # rendered Markdown, one profile (0019)
├── document.json        # canonical pretty JSON of DocumentIR (0016)
├── manifest.json        # bundle/version/hash/status metadata (below)
├── diagnostics.json     # the DocumentIR.diagnostics array, verbatim
└── raw/
    ├── page.html        # present only when rawHtmlIncluded == true
    └── README.txt       # present only with page.html; lists what was stripped
```

`<capture-slug>` = deterministic slug of title + short `documentContentIdentity`
prefix; it never contains the timestamp.

### Raw HTML: user-selectable, kind-defaulted

- `article` / `technical_article`: `rawHtmlIncluded` defaults **on**.
- `conversation`: defaults **off**. A ChatGPT page carries other-branch
  fragments, account UI, and potentially personal data; the user must opt in
  per capture.
- When included, `raw/page.html` is the **cloned, sanitized** DOM serialization:
  `<script>`, `<template>` shadow payloads, event-handler attributes
  (`on*`), and — for conversations — every non-selected-branch message subtree
  are removed; sentinels are **not** present (raw is captured before sentinel
  substitution, then sanitized). `raw/README.txt` enumerates the removed
  categories and counts.
- Raw HTML is never the evidence source for the IR beyond what detectors and
  the extractor already read; it is an archival courtesy, not a parallel truth.

### Canonical JSON & newlines

Per `0016`: on-disk JSON is the pretty form, LF newlines, one trailing LF.
`content.md` ends with exactly one trailing LF unless the final block is a code
block whose `hasFinalNewline` is false and it is the last line — in that case
the fence's closing line still gets its LF; code-internal final-newline state
lives inside the fence.

### ZIP determinism

- Entry order: fixed, lexicographic by path.
- Timestamps: every entry set to `1980-01-01T00:00:00Z` (DOS epoch).
- External attributes: files `0644`, the one directory `0755`.
- Compression: DEFLATE at a fixed level (6), or STORE for entries < 64 bytes;
  the choice is a pure function of content so it is reproducible.
- No extra fields, no archive comment, no UID/GID.

### Content identity vs. event metadata

Two captures of **identical page content** at different times produce:

- **identical** `content.md`, `document.json`, `diagnostics.json`,
  `raw/page.html`, and every hash including `documentContentIdentity`;
- **different** `manifest.json` (it embeds `capture.timestamp`), therefore
  **different whole-bundle bytes**.

The MVP promises **content-hash identity, not whole-bundle byte identity**, and
`docs/capture-format.md` must say so in exactly those terms. `manifest.json`
separates the two:

```
manifest.json {
  bundleFormatVersion: "1.0.0",
  irSchemaVersion: <int>,
  normalizationRulesets: { prose: "norm/prose@1", code: "norm/code@1", infostring: "norm/infostring@1" },
  extractorVersion: string,
  detectors: [ { id, version } ],
  adapters: [ { name, version } ],
  clipSpec: { id, version } | null,
  captureKind: 'article' | 'technical_article' | 'conversation',
  markdownProfile: 'commonmark' | 'gfm' | 'obsidian',
  contentIdentity: {
    documentContentIdentity: <sha256>,
    markdown: <sha256>,
    rawPageHtml: <sha256> | null,
    blocks: { <nodeId>: <sha256> },      // per code block + per message
  },
  event: {
    timestamp: <ISO-8601 UTC>,
    sourceUrl: string,
    canonicalUrl: string | null,
    captureScope: string,
    pageLoadState: PageLoadState,
  },
  exportStatus: 'complete' | 'complete_with_warnings' | 'partial' | 'failed',
  diagnosticsSummary: { info: n, warning: n, error: n, fatal: n },
  rawHtmlIncluded: boolean
}
```

### Manifest / schema versioning & forward compatibility

- `bundleFormatVersion` and `irSchemaVersion` are independent.
  `bundleFormatVersion` is semver; a reader must reject an unknown **major**,
  may accept an unknown **minor** while ignoring unknown added fields.
- `irSchemaVersion` is an integer; an unknown node `type` or a higher schema
  version than the reader knows is a **validation error**, never a silent drop
  (`0011`).

### Remote assets and inaccessible attachments

- Images: `document.json` records `ImageRef { url (absolute), alt,
intrinsicWidth?, intrinsicHeight?, resolved: false }`. Never downloaded
  (non-goal). `content.md` emits a standard image link to the absolute URL.
- ChatGPT attachments: recorded as
  `AttachmentRef { name, kind, state: 'not-downloaded', reason }`. Generated
  images and authenticated downloads are out of scope (non-goal); their
  visible metadata is still recorded.

### Incomplete page-load detection (`PageLoadState`)

Captured into `SourceMetadata.pageLoadState`:

```
PageLoadState {
  documentReadyState: string,
  belowFoldLazyImages: number,        // loading="lazy" not yet loaded
  skeletonOrPlaceholderNodes: number, // known loading-skeleton patterns
  infiniteScrollSentinelPresent: boolean,
  conversationStreaming: boolean,     // ChatGPT "stop generating" / cursor present
  observedAt: <ISO-8601 UTC>
}
```

`conversationStreaming: true` ⇒ fatal for a `conversation` capture (`0015`).
The others ⇒ `warning` and status ≤ `complete_with_warnings` (or `partial` if
a required section is affected).

## Alternatives considered

- **Always embed raw HTML** — rejected for conversations on privacy grounds.
- **Never embed raw HTML** — rejected: archival users of article captures
  reasonably want the source; opt-out is enough there.
- **Set ZIP timestamps to capture time** — rejected: needlessly breaks
  file-level reproducibility; the manifest already carries the event time.
- **Hash the whole ZIP as the identity** — rejected by § 16.
- **One combined version number** — rejected: bundle packaging and IR schema
  evolve at different rates.

## Consequences

- Phase 7 implements a small deterministic ZIP writer (or a pinned library
  whose output is asserted byte-stable by a fixture) — decided in the Phase 7
  plan.
- `docs/capture-format.md` is replaced with the real contract in Phase 7 and
  links here.
- `docs/privacy-and-security.md` gains the raw-HTML/ChatGPT policy in Phase 7.
