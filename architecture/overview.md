# Architecture overview

This document describes the _current implemented_ architecture first, then
the _target_ architecture it is heading toward. Do not read the target
section as already true — it is refined as later phases land, per
`AGENTS.md` § documentation sync.

## Current state (Phase 0)

A pnpm/TypeScript workspace with four packages, none of which contain real
capture behaviour yet:

- `packages/core` — exports a `NotImplementedError`/`notImplemented()` pair
  and a `CORE_PACKAGE_STATUS = 'scaffold'` marker. No IR types exist yet.
- `packages/detectors` — depends on `core`; exports a stub
  `detectComponents()` that throws. No real detectors exist yet.
- `packages/adapters` — depends on `core`; exports a stub `adaptDocument()`
  that throws. No real adapters exist yet.
- `packages/extension` — a Manifest V3 shell with a zero-permission
  `manifest.json` and an empty background service worker. No capture action,
  preview UI, or Obsidian handoff exists yet.

There is no DOM capture pipeline, no rendering, and no capture bundle output.
CI (`.github/workflows/ci.yml`) runs format-check/lint/typecheck/build/test
across the workspace — these are the only currently-real invariants.

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

## Package responsibilities (target)

| Package              | Responsibility                                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/core`      | Typed IR contracts, provenance/confidence semantics, canonical normalization, hashing. Browser-independent, pure functions.               |
| `packages/detectors` | `ComponentDetector` implementations + deterministic precedence/overlap resolution for code, terminal, and tab-group structures.           |
| `packages/adapters`  | Site/conversation `Adapter` implementations (Docusaurus, ChatGPT) plus the minimum ClipSpec override seam.                                |
| `packages/extension` | Thin Chromium MV3 shell: capture action, preview UI, completeness report, copy/download/Obsidian handoff. No extraction logic of its own. |

This table will grow as Phase 1 planning settles the exact contracts named
in `planning/v0-to-mvp-planning-prompt.md` § 10.
