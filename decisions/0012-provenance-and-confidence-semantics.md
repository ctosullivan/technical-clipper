# 0012. Provenance, evidence, and confidence semantics

## Status

Accepted (Phase 1 planning). Implemented in Phase 3; enforced from Phase 4 on.

## Context

`planning/v0-to-mvp-planning-prompt.md` § 8, § 10, and `ai-docs/AGENTS.md`
require that every extracted artifact carries what evidence it came from and how
confident the extractor is, and that "exact" is only meaningful relative to a
named observable browser source. This must be one shared contract so the
validator, renderer, diagnostics, and release gates all agree.

## Decision

### `Provenance`

Attached to every `CodeBlockIR`, `CodeGroupIR`, `TerminalSessionIR`, article
root, and any adapter-produced block:

```
Provenance {
  method: string          // 'general-extractor' | 'detector' | 'adapter' | 'clipspec'
  methodVersion: string    // semver of the extractor/detector/adapter
  detectorId?: string
  adapter?: { name: string; version: string }
  evidenceSource: EvidenceSource
  notes?: string           // free text, e.g. 'language from <code class="language-ts">'
}
```

### `EvidenceSource` (what "exact" is relative to)

- `dom-text-content` — `textContent` of an exposed copy-source / `<code>`
  node in the cloned DOM. The strongest claim the MVP can normally make.
- `dom-rendered-reconstruction` — reassembled from rendered inline/token spans
  (e.g. Prism `<span>` soup) because no single copy-source node exists.
- `attribute-value` — recovered from a `data-*` / `value` attribute payload.
- `http-response-bytes` — the original response bytes. **Not available** to an
  MV3 content script in the MVP; reserved so the enum does not need a breaking
  change later. Using it requires a new ADR.

A capture must never claim `http-response-bytes` fidelity from DOM evidence.

### `Confidence`

- `exact` — the stored `text` is byte-for-byte identical to the named
  `evidenceSource`, with **zero** transformation. Requires `evidenceSource` of
  `dom-text-content` or `attribute-value`. Final-newline state is recorded as a
  flag, not altered.
- `normalized` — transformed only by a named, versioned normalization ruleset
  (`0016`). **Code bytes are never changed under `normalized`** — only a BOM
  strip (recorded) and line-ending _recording_ (not rewriting) are permitted.
  `normalized` is the normal state for prose text; for code it means only
  "BOM stripped" and nothing else.
- `approximate` — content recovered with known lossy reconstruction (e.g.
  `dom-rendered-reconstruction` where token spans may have dropped
  significant whitespace, or a terminal whose input/output split is inferred).
  **Always** accompanied by a `warning` or `error` diagnostic (`0015`).
- `failed` — the component was detected but could not be extracted. No
  content string is emitted (empty `text`, `confidence: 'failed'`); a
  diagnostic is emitted, `blocksExport` per `0015`.

### Enforcement rules

1. A normalization that would change code bytes while the block is still
   labelled `exact` or `normalized` is a **stop-and-ask** condition
   (`AGENTS.md`), not an automatic downgrade.
2. `exact` on a `dom-rendered-reconstruction` source is forbidden by the
   validator.
3. The renderer must not upgrade confidence; it may only surface it.
4. The completeness report and bundle manifest count blocks by
   `confidence` — `detected / exact / approximate / failed` (§ 3.3).

## Alternatives considered

- **Single boolean `isExact`** — rejected: cannot express the
  reconstruction/terminal-inference middle ground without either lying or
  failing.
- **Numeric confidence score** — rejected: not independently checkable, invites
  arbitrary thresholds; the release gates need categorical guarantees
  ("100% exact-text preservation for supported fixtures").
- **Letting the renderer re-derive confidence from the text** — rejected:
  confidence is an extraction-time evidential claim, not a property of the
  string.

## Consequences

- Phase 3's validator rejects any leaf missing `evidenceSource`/`confidence`
  or violating the enforcement rules above.
- Phase 5/6 detectors and adapters must set these fields explicitly; a default
  is not provided.
- `ai-docs/AGENTS.md`'s evidence-boundary section becomes normative rather than
  advisory once Phase 3 lands; update it to point here.
