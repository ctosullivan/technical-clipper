# 0011. Typed IR family and capture/source kinds

## Status

Accepted (Phase 1 planning). Implemented in Phase 3.

## Context

`decisions/0003` settled that capture flows into a typed IR that every output
renders from, but deferred the exact contracts to Phase 1
(`planning/v0-to-mvp-planning-prompt.md` § 10). The phase plans for 3–7 cannot
be written until the IR shape, the discriminated block/inline node set, and the
capture/source kinds are fixed. § 10 also requires that unrelated content
(`article`, `technical_article`, `conversation`) is not forced into one schema
shape.

## Decision

### Top-level container — `DocumentIR`

```
DocumentIR {
  schemaVersion: number            // integer, bumped on any breaking node change
  captureKind: 'article' | 'technical_article' | 'conversation'
  source: SourceMetadata
  body: ArticleIR | ConversationIR // discriminated by captureKind
  diagnostics: Diagnostic[]        // see 0015
  hashes: HashSet                  // see 0016
}

SourceMetadata {
  captureTimestamp: string   // ISO-8601 UTC; the only intentionally volatile field
  sourceUrl: string
  canonicalUrl: string | null
  title: string | null
  byline: string | null
  publishedDate: string | null
  captureScope: string       // e.g. 'full-article', 'chatgpt-current-branch'
  extractorVersion: string
  pageLoadState: PageLoadState  // see 0017 (incomplete-load detection)
}
```

`captureKind` distinguishes `technical_article` from `article` only as a
provenance/reporting hint (a page that triggered a code detector or a technical
site adapter); both use `ArticleIR`. `conversation` uses `ConversationIR`.

### `ArticleIR`

```
ArticleIR {
  articleRoot: ArticleRootProvenance  // selected root selector/path, method, version
  metadata: ArticleMetadata           // lead, headings summary, reading-order note
  blocks: BlockNode[]                  // ordered, document order
  footnotes: FootnoteDefinition[]
  references: ReferenceEntry[]         // bibliography / citation targets
  removedRegions: RemovedRegion[]      // what main-content selection excluded + why
}
```

### `ConversationIR`

```
ConversationIR {
  conversationTitle: string | null
  modelLabel: string | null           // only if visibly exposed by the UI
  branchEvidence: BranchEvidence       // how current-branch completeness was established
  messages: MessageIR[]                // current selected branch only, in order
}

MessageIR {
  id: string                          // see 0014
  role: 'user' | 'assistant' | 'system' | 'tool'
  order: number                       // 0-based within the captured branch
  roleEvidence: string                // DOM signal used to assign the role
  blocks: BlockNode[]                  // same node set as ArticleIR
  attachments: AttachmentRef[]         // visible attachment metadata only
  hash: string                        // see 0016
}
```

### Block nodes — `BlockNode` (discriminated union on `type`)

`heading` (level 1–6, inlines, id), `paragraph` (inlines), `list`
(ordered|unordered, tight|loose, `items: ListItem[]`), `listItem`
(`blocks: BlockNode[]`), `blockquote` (`blocks`), `codeBlock` (embeds
`CodeBlockIR`), `codeGroup` (embeds `CodeGroupIR`), `terminalSession` (embeds
`TerminalSessionIR`), `table` (`TableIR`: header rows, body rows, column
alignment, per-cell inlines), `figure` (`image: ImageRef`, `caption: inlines`,
`altText: string | null`), `thematicBreak`, `htmlBlock` (`rawHtml: string`,
never rendered without sanitization — see 0017), `footnoteDefinition`
(`label`, `blocks`), `mathBlock` (`tex: string`; only when the page exposes a
recoverable TeX source, else the source region becomes an `approximate`
diagnostic).

### Inline nodes — `InlineNode` (discriminated union on `type`)

`text`, `emphasis`, `strong`, `strikethrough`, `codeSpan` (`text`, exact),
`link` (`children: InlineNode[]`, `href` resolved-absolute, `title`),
`image` (`ImageRef`), `footnoteRef` (`label`), `citationRef`
(`referenceId`), `lineBreak` (`hard: boolean`), `rawInlineHtml` (`rawHtml`,
sanitized on render).

### Leaf contracts

```
CodeBlockIR {
  id: string                          // see 0014, content-addressed on exact bytes
  text: string                        // exact; no normalization (0016)
  hasFinalNewline: boolean
  language: string | null             // normalized token (0016)
  languageEvidence: LanguageEvidence  // 'info-string' | 'class-token' | 'adapter' | 'inferred-heuristic' | 'none'
  filename: string | null
  caption: string | null
  highlightedLines: number[] | null
  extraction: Provenance              // see 0012
  confidence: 'exact' | 'normalized' | 'approximate' | 'failed'   // see 0012
  evidenceSource: EvidenceSource      // see 0012
  hash: string                        // see 0016
}

CodeGroupIR {
  id: string
  label: string | null
  groupKind: 'docusaurus-tabs' | 'generic-tabs'
  members: { label: string; code: CodeBlockIR }[]   // every accessible alternative retained
  defaultMemberIndex: number | null
  extraction: Provenance
}

TerminalSessionIR {
  id: string
  entries: { stream: 'input' | 'output'; text: string; hasFinalNewline: boolean }[]
  streamEvidence: string              // DOM signal used to separate input from output
  extraction: Provenance
  confidence: 'exact' | 'normalized' | 'approximate' | 'failed'
}
```

Article structural sub-contracts: `FootnoteDefinition`, `ReferenceEntry`
(`id`, `rawText`, `structuredFields?`, `sourceUrl?`), `TableIR`, `ImageRef`
(`url` resolved-absolute, `alt`, `intrinsicWidth?`, `intrinsicHeight?`,
`resolved: false` — never downloaded), `RemovedRegion` (`selectorPath`,
`reason`, `approxTextLength`).

## Alternatives considered

- **One flat `DocumentIR` with optional article/conversation fields** —
  rejected: makes every consumer branch on presence checks and weakens the
  § 10 "don't force unrelated content into one schema shape" requirement.
- **Separate inline node sets per container** — rejected: messages contain the
  same prose/code structures as articles; one node set keeps the renderer and
  validator single-implementation.
- **Storing rendered HTML per block instead of typed inlines** — rejected:
  reintroduces the DOM-to-output coupling that `decisions/0003` forbids.

## Consequences

- Phase 3 implements these as TypeScript types + a runtime validator in
  `packages/core`; no `any`, exhaustive discriminated-union switches.
- Adding a node `type` later is a `schemaVersion` bump with an ADR and updated
  fixtures; an unknown `type` at read time is a validation error, never a
  silent drop.
- `CodeBlockIR`/`CodeGroupIR`/`TerminalSessionIR` are referenced by embedding,
  not by id indirection, keeping the IR a single serializable tree.
- Detectors (Phase 5) and adapters (Phase 6) produce these leaf contracts
  directly; the general extractor (Phase 4) only produces article block/inline
  nodes plus sentinels.
