# 0015. Diagnostics model and export status levels

## Status

Accepted (Phase 1 planning). Implemented incrementally: shape in Phase 3,
producers in Phases 4–7, policy engine in Phase 8.

## Context

§ 3.5 requires a defined split between fatal errors that disable export and
warnings that merely degrade status. § 10 requires diagnostics with severity,
code, source location, human message, and an export-blocking flag. § 10 also
fixes the export status vocabulary: `complete`, `complete_with_warnings`,
`partial`, `failed`.

## Decision

### `Diagnostic`

```
Diagnostic {
  code: string          // stable, namespaced: TC-<AREA>-<NNN>, e.g. TC-EXTRACT-014
  severity: 'info' | 'warning' | 'error' | 'fatal'
  message: string       // human-readable, specific, no stack traces
  phase: 'detect' | 'extract' | 'adapt' | 'assemble' | 'validate' | 'render' | 'bundle'
  sourceLocation?: {
    nodeId?: string
    domPath?: string    // stable structural path in the cloned DOM
    fixturePath?: string
  }
  blocksExport: boolean
  data?: Record<string, string | number | boolean>   // machine detail, canonical-JSON-safe
}
```

Codes are defined in one registry file (`packages/core/src/diagnostics/registry.ts`)
with `{ code, defaultSeverity, defaultBlocksExport, description }`. Producers may
raise severity for a specific occurrence but not silently lower it below the
registry default.

### Severity meanings

- `info` — recorded for the audit trail; no status effect (e.g. an infobox was
  included by policy, a detector overlap was resolved).
- `warning` — capture believed complete but a non-critical uncertainty exists
  (low-confidence language inference, missing alt text on one figure).
- `error` — known content loss or unresolved reference that does **not** by
  itself make the capture worthless (one failed non-critical code block, one
  unresolved citation target). `blocksExport` defaults `false`.
- `fatal` — the capture cannot be trusted as a whole. `blocksExport` always
  `true`.

### Export status derivation (evaluated after IR validation)

| status                   | condition                                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `failed`                 | any `fatal` diagnostic, or IR schema validation failed                                                      |
| `partial`                | no `fatal`; at least one `error`, **or** any completeness assertion (`0020` / Phase 8) reports lost content |
| `complete_with_warnings` | no `fatal`/`error`; at least one `warning`                                                                  |
| `complete`               | no `fatal`/`error`/`warning`; all completeness assertions passed                                            |

### Fatal conditions (export disabled) — the MVP set

- No deterministic article root could be selected.
- IR fails schema validation (`0011`).
- `TC-EXTRACT-SENTINEL-LOST` — protected code dropped by the general extractor
  (`0013`).
- ChatGPT current-branch completeness/roles cannot be established from stable
  DOM evidence (`branchEvidence` insufficient).
- Rendered Markdown fails the render-back check: a `codeBlock`'s fenced content
  does not byte-match its `CodeBlockIR.text` (`0016`).
- Two site adapters match the same capture.
- Page load detected as still streaming / materially incomplete (`0017`) for a
  `conversation` capture.

### Degrading (export allowed, status ≤ `partial`, warning shown + recorded)

Lost non-critical article section with a recorded `RemovedRegion`; a single
`failed` code block among others; unresolved citation target; unresolvable
remote asset URL; low-confidence language inference; infobox include/exclude
policy note; incomplete lazy-loaded images on an `article` capture.

### Export gate

The extension may present **copy / Obsidian / download** only when
`exportStatus !== 'failed'`. For `partial`, the completeness report must be
visible and the same diagnostics array is written verbatim into
`diagnostics.json` in the bundle.

## Alternatives considered

- **Free-form severity strings** — rejected: the status-derivation table and
  release gates need a closed set.
- **Per-producer ad-hoc blocking decisions** — rejected: a central registry +
  the derivation table make "why is export blocked?" answerable from data.
- **Allowing `complete` with `warning`s** — rejected: contradicts § 1
  ("uncertainty … is reported before export") — a warning is uncertainty.

## Consequences

- Phase 8 is essentially "implement the derivation table + the completeness
  assertions that can flip a capture to `partial`."
- Every new diagnostic needs a registry entry and, per `AGENTS.md`, a
  regression fixture.
- `ai-docs/AGENTS.md` diagnostics paragraph updates to reference this ADR.
