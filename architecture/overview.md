# Architecture overview

This document describes the _current implemented_ architecture first, then
the _target_ architecture it is heading toward. Do not read the target
section as already true — it is refined as later phases land, per
`AGENTS.md` § documentation sync.

## Current state (Phase 2)

A pnpm/TypeScript workspace with four packages, none of which contain real
capture behaviour yet, plus a development-time Claude skill:

- `packages/core` — exports a `NotImplementedError`/`notImplemented()` pair
  and a `CORE_PACKAGE_STATUS = 'scaffold'` marker. No IR types exist yet.
- `packages/detectors` — depends on `core`; exports a stub
  `detectComponents()` that throws. No real detectors exist yet.
- `packages/adapters` — depends on `core`; exports a stub `adaptDocument()`
  that throws. No real adapters exist yet.
- `packages/extension` — a Manifest V3 shell with a zero-permission
  `manifest.json` and an empty background service worker. No capture action,
  preview UI, or Obsidian handoff exists yet.

- `.claude/skills/markdown-clipping/` — a **development-time** Claude skill
  (Phase 2): profile-separated CommonMark / GFM / Obsidian reference notes, a
  clipping anti-pattern catalogue, a source register with retrieval dates and
  derived-note hashes, and a dependency-free offline verifier
  (`scripts/verify-examples.mjs`). It is not shipped in the extension and is
  never authority to change extraction behaviour (`decisions/0002`, `0021`).

There is no DOM capture pipeline, no rendering, and no capture bundle output.
CI (`.github/workflows/ci.yml`) runs
format-check/lint/typecheck/build/test/skill:verify across the workspace —
these are the only currently-real invariants.

## Target architecture

```text
                 ┌─────────────────────────────────────────┐
                 │           packages/extension             │
                 │  (Chromium MV3 shell: action, preview,    │
                 │   copy, Obsidian handoff, bundle download)│
                 └───────────────┬───────────────────────────┘
                                 │ invokes the capture pipeline
                                 ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ 1. Clone rendered DOM (no live-page mutation, no network)     │
   │ 2. detectors: locate code/terminal/tab-group components       │
   │ 3. Replace detected components with stable sentinels          │
   │ 4. General article extraction (Defuddle-style) over the        │
   │    sentinel-bearing clone — standard articles incl. Wikipedia │
   │ 5. adapters: apply narrow site/conversation adapters           │
   │    (Docusaurus tab groups, ChatGPT current-branch messages)   │
   │ 6. Restore structured code/terminal/group nodes at sentinels   │
   │ 7. Assemble + validate typed IR (core): DocumentIR /            │
   │    ArticleIR / ConversationIR, with provenance + confidence    │
   │ 8. Render from IR: profile-aware Markdown (CommonMark / GFM /  │
   │    Obsidian), canonical JSON, hashes, diagnostics              │
   │ 9. Assemble deterministic capture bundle (ZIP)                 │
   └─────────────────────────────────────────────────────────────┘
```

Key properties (see `AGENTS.md` § non-negotiable constraints and the
matching ADRs in `decisions/`):

- Steps 1–9 run with no network requests and no execution of captured code.
- The IR (step 7) is the single source of truth — nothing renders directly
  from the DOM.
- AI is never in this runtime path; it may only propose adapters/ClipSpec
  patches that a human reviews and merges as versioned, fixture-backed rules.
- Every step that cannot produce an exact result emits a diagnostic instead
  of silently degrading.

Between step 7 (assemble + validate IR) and export, an **evaluate** stage
(Phase 8) runs cross-stage fidelity assertions (sentinel balance, section /
citation / figure retention, code accounting, conversation order/roles, page
load state) and derives the export status.

## Package responsibilities (target)

| Package              | Responsibility                                                                                                                                                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/core`      | Typed IR contracts, provenance/confidence semantics, diagnostics + export-status derivation, canonical serialization, normalization rulesets, node ids, hashing, fence selection, IR→Markdown renderer, capture-bundle assembly. Browser-independent, pure functions. |
| `packages/pipeline`  | Capture orchestrator (clone → detect → sentinel → general extract → adapt → restore → assemble). Consumes a pinned DOM implementation for fixtures; receives the live cloned DOM in the extension.                                                                    |
| `packages/detectors` | `ComponentDetector` implementations + the fixed precedence table and overlap-resolution algorithm for code, terminal, and tab-group structures.                                                                                                                       |
| `packages/adapters`  | Site/conversation `Adapter` implementations (Docusaurus, ChatGPT current-branch) plus the ClipSpec resolver and effective-config merge.                                                                                                                               |
| `packages/extension` | Thin Chromium MV3 shell: capture action, preview UI, completeness report, copy/download/Obsidian handoff. No extraction logic of its own.                                                                                                                             |

`packages/pipeline` may instead live as `packages/core/src/pipeline/` — the
Phase 4 plan decides. The exact contracts these packages implement are settled
in ADRs 0011–0020 (`planning/ROADMAP.md` § "Cross-phase ADRs settled in
Phase 1"):

- **IR family** (`0011`) — `DocumentIR` container discriminated on
  `captureKind` (`article` / `technical_article` / `conversation`) wrapping
  `ArticleIR` or `ConversationIR`; one shared block/inline node set;
  `CodeBlockIR` / `CodeGroupIR` / `TerminalSessionIR` embedded by value.
- **Provenance & confidence** (`0012`) — every extracted artifact records
  `method` / `methodVersion` / `evidenceSource` and a `confidence` of
  `exact` (byte-identical to a named DOM source, zero transformation) /
  `normalized` / `approximate` (always paired with a diagnostic) / `failed`.
- **Detector/adapter seam** (`0013`) — pure-reader detectors, a fixed priority
  table (terminal > code-group > highlighted block > generic pre/code),
  deterministic overlap resolution, and a comment-node sentinel protocol;
  sentinel loss is fatal.
- **Node ids** (`0014`) — `base32(sha256(seed))[:16]`, content-addressed for
  code, independent of generated CSS classes.
- **Diagnostics & status** (`0015`) — `{ code, severity, message, phase,
sourceLocation?, blocksExport }` from a central registry; status derived as
  `failed` / `partial` / `complete_with_warnings` / `complete`; export blocked
  on `failed`, visible warning required on `partial`.
- **Canonical form** (`0016`) — compact-JSON hashing / pretty-JSON files,
  `norm/prose@1` vs `norm/code@1` (code bytes never altered beyond a BOM
  strip), fixed hashing boundaries, and a safe fence-selection algorithm with
  render-back verification.
- **Bundle** (`0017`) — `content.md` / `document.json` / `manifest.json` /
  `diagnostics.json` / optional sanitized `raw/page.html`; deterministic ZIP;
  manifest separates `contentIdentity` (hashes) from `event` (timestamp).
  Content-hash identity is promised, whole-bundle byte identity is not.
- **ClipSpec seam** (`0018`), **Markdown profiles** (`0019`), **fixture
  corpus + release-gate map** (`0020`).
