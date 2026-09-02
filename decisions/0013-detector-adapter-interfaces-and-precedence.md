# 0013. Detector and adapter interfaces, precedence, and the sentinel protocol

## Status

Accepted (Phase 1 planning). Interfaces implemented in Phase 3; detectors in
Phase 5; adapters in Phase 6.

## Context

`decisions/0005` fixed the pipeline shape (detect code → sentinel → general
extract → adapt → restore) and flagged that deterministic detector precedence
and overlap resolution must be specified before Phase 5/6. § 10 also requires
`ComponentDetector` and `Adapter` interfaces and a stable, class-free sentinel
mechanism.

## Decision

### `ComponentDetector`

```
ComponentDetector {
  id: string                 // stable, namespaced, e.g. 'code/pre-code'
  version: string            // semver
  priority: number           // fixed integer; higher wins overlaps (see below)
  detect(root: Element): DetectedComponent[]
}

DetectedComponent {
  detectorId: string
  kind: 'code' | 'code-group' | 'terminal'
  range: DomRange            // start/end via stable structural path, not CSS class
  confidenceHint: 'high' | 'low'
  extract(): CodeBlockIR | CodeGroupIR | TerminalSessionIR   // sets Provenance/confidence (0012)
}
```

Detectors are **pure readers** of the cloned DOM. They never mutate it; the
pipeline performs sentinel substitution using the returned ranges.

### `Adapter`

```
Adapter {
  name: string
  version: string            // semver
  appliesTo(ctx: { url: string; doc: Document }): boolean   // deterministic, no network
  adapt(ctx: AdapterContext): AdapterResult
}
```

Adapters run **after** general extraction and **before** sentinel restore. They
may: reorder/regroup blocks, attach group/label metadata, supply
`ConversationIR` message structure, mark regions as removed, and attach
diagnostics. They may not fabricate code content — that is the detectors' job.
Exactly one site adapter and one conversation adapter may apply per capture; if
two site adapters match, that is a fatal diagnostic (`0015`).

### Detector precedence and overlap resolution

Fixed priority order (specific → generic):

| priority | detector class                                       |
| -------: | ---------------------------------------------------- |
|       40 | terminal session                                     |
|       30 | code group (tabbed)                                  |
|       20 | single highlighted code block (Prism / Highlight.js) |
|       10 | generic `<pre><code>` / block-level `<code>`         |

Resolution algorithm (deterministic):

1. Collect all `DetectedComponent`s.
2. Sort by `(priority desc, range.startPath doc-order asc, detectorId asc)`.
3. Walk the sorted list; accept a component only if its range does not overlap
   any already-accepted range.
4. A rejected component that **partially** overlaps: if its non-overlapping
   remainder is itself a complete extractable unit, re-queue the remainder;
   otherwise drop it and emit an `info` diagnostic recording the resolution
   (`detectorId`, winning `detectorId`, range).
5. Two components with identical `(priority, startPath, detectorId)` and
   overlapping ranges ⇒ fatal diagnostic (non-deterministic detector set).

### Sentinel protocol

- Each accepted component's range is replaced in the clone by a single
  sentinel node: an HTML comment `<!--tc-sentinel:{nodeId}-->` (comment, not
  element, so no extractor treats it as content and no CSS/class is involved).
- `nodeId` is the leaf IR id from `0014`.
- The general extractor must preserve comment nodes in output position. After
  extraction, every emitted sentinel is matched back to its leaf IR node by id.
- A sentinel present in the IR leaf set but absent from post-extraction output
  ⇒ **fatal** diagnostic `TC-EXTRACT-SENTINEL-LOST` (protected code was dropped);
  export blocked.
- A sentinel in output with no matching leaf ⇒ fatal (pipeline bug).

## Alternatives considered

- **Let detectors mutate the DOM directly** — rejected: makes precedence
  order-of-execution-dependent and hard to test in isolation.
- **`z-index`-style dynamic priority from confidence** — rejected:
  non-deterministic across fixture edits; a fixed table is auditable.
- **Element sentinels with a data attribute** — rejected: some general
  extractors strip unknown elements or attributes; a comment node survives
  Defuddle-style cleaning more reliably and carries zero class surface.

## Consequences

- The priority table lives in `packages/detectors` as a single exported
  constant; adding a detector means placing it in the table with an ADR note.
- Phase 5 tests must include overlap fixtures (a `<pre>` inside a tab group,
  a terminal rendered with Prism classes) asserting the exact resolution.
- Adapter `appliesTo` must be pure and offline; a fixture locks each adapter's
  match set.
