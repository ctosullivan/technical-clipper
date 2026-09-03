# Architecture overview

This document describes the _current implemented_ architecture first, then
the _target_ architecture it is heading toward. Do not read the target
section as already true — it is refined as later phases land, per
`AGENTS.md` § documentation sync.

## Current state (Phase 10 — MVP candidate)

A pnpm/TypeScript workspace, all five packages implemented: `packages/core`
(browser-independent foundation + IR→Markdown renderer + deterministic capture
bundle + completeness/evaluate layer), `packages/detectors`
(code/terminal/tab-group detectors), `packages/adapters` (ChatGPT conversation
adapter + ClipSpec seam), `packages/pipeline` (capture orchestrator, article
**and** conversation paths), and `packages/extension` (the loadable Chromium
MV3 dev extension); plus a development-time Claude skill:

- `packages/core` — **implemented** (Phase 3): the typed IR family
  (`DocumentIR` / `ArticleIR` / `ConversationIR` / `MessageIR`, the shared
  block/inline node set, `CodeBlockIR` / `CodeGroupIR` / `TerminalSessionIR`),
  provenance / confidence semantics + legality predicates, the diagnostics
  registry and `deriveExportStatus`, canonical JSON
  (`canonicalize` / `canonicalizePretty`), the normalization rulesets
  (`norm/prose@1`, `norm/code@1`, `norm/infostring@1`), content-addressable
  node ids, SHA-256 hashing with fixed boundaries, safe Markdown fence
  selection, and `validateDocumentIR`, plus the IR→Markdown renderer, the
  deterministic capture bundle, and the `evaluateCapture` completeness layer.
  All pure functions, no DOM, and `node:`-free (sync pure-JS SHA-256).
- `packages/pipeline` — **implemented** (Phase 4): the capture orchestrator.
  `capture()` clones the rendered DOM (linkedom for fixtures, `decisions/0022`),
  runs the detector→sentinel seam (`decisions/0013`; detectors are injected —
  real ones arrive in Phase 5), removes structural chrome into `RemovedRegion`s,
  selects a deterministic article root by density scoring (`decisions/0023`,
  `TC-EXTRACT-NOROOT` fatal), extracts DOM → `ArticleIR` block/inline nodes
  (Wikipedia infobox/navbox policy per `decisions/0024`), restores protected
  code at sentinels with a balance check, and assembles + validates a
  `DocumentIR` with hashes and a derived export status — for article **and**
  conversation captures, with the standard detector + ChatGPT adapter registries
  wired in by default. All offline, run inside a network trap. Root selection
  ascends/descends the candidate lattice to survive MediaWiki `<section>`
  segmentation; loose inline runs coalesce into paragraphs.
- `packages/detectors` — **implemented** (Phase 5): the standard code/terminal
  detector set — `code/pre-code`, `code/blocklevel-code`, `code/prism`,
  `code/highlightjs` (exact from a copy-source or token `textContent`, else
  `approximate` reconstruction from a line-number-table layout),
  `terminal/session` (explicit input/output markup → `exact`, prompt-span
  split → `approximate`), and a virtualized-editor guard (`monaco` / `cm` /
  `ace` → `failed` + `TC-DETECT-VIRTUALIZED`, never fake content). Chrome
  stripping removes line-number gutters, copy buttons, and language pills;
  language inference is `decisions/0025`. `standardDetectorRegistry()` is the
  default `capture()` uses.
- `packages/detectors` also carries `code/docusaurus-tabs` (Phase 6, priority
  30): groups the code blocks inside a Docusaurus `<Tabs>` widget into a
  `CodeGroupIR` retaining every alternative + label (`decisions/0027`).
- `packages/adapters` — **implemented** (Phase 6): the ChatGPT current-branch
  conversation adapter (`ConversationIR`; role/branch evidence per
  `decisions/0026`; streaming ⇒ fatal `TC-ADAPT-STREAMING`; attachments as
  metadata only), and the ClipSpec override seam (`resolveClipSpec` +
  `mergeEffectiveConfig`, `decisions/0018`). Message content reuses the
  standard code detectors.
- `packages/extension` — **implemented** (Phase 9): the Chromium MV3
  extension. The **Clip page** toolbar action injects `capture-in-page.js`
  (only `activeTab` + `scripting`), which runs the pipeline against the live
  DOM inside the network trap and posts the result back; the service worker
  stashes it and opens a results page showing the completeness report + a
  Markdown preview + Copy / Send-to-Obsidian (`decisions/0033`) /
  Download-bundle actions, gated by export status. Bundled with esbuild
  (`decisions/0032`); `core` is now `node:`-free (a sync pure-JS SHA-256).
  Least-privilege manifest, no host permissions.

- `.claude/skills/markdown-clipping/` — a **development-time** Claude skill
  (Phase 2): profile-separated CommonMark / GFM / Obsidian reference notes, a
  clipping anti-pattern catalogue, a source register with retrieval dates and
  derived-note hashes, and a dependency-free offline verifier
  (`scripts/verify-examples.mjs`). It is not shipped in the extension and is
  never authority to change extraction behaviour (`decisions/0002`, `0021`).

The full path — Clip page → capture → validated `DocumentIR` →
profile-aware Markdown, a deterministic capture bundle, a completeness report,
and the export gate — works end to end. The pipeline is verified over a fixture
corpus at the § 12 minimums: 22 article fixtures (incl. 5 revision-pinned
Wikipedia read-view captures with full provenance), 19 code fixtures, 4
conversation fixtures, each with golden `expected.*` files. Release gates 1–15
(`decisions/0020`) run as `pnpm gates`; `pnpm fixture-lint` checks corpus
completeness + provenance; both run in CI alongside
format-check/lint/typecheck/build/test/skill:verify (~160 deterministic tests).
The security review, timing reference environment, Obsidian checklist, and the
gate-17 comparative benchmark are in `docs/evaluation/`. The MVP is a
loadable unpacked build (`pnpm package:extension`); it is not tagged or
published pending explicit release approval.

The renderer (`packages/core/src/render/`) is one IR walker with three profile
configs (`decisions/0019`, `0030`); every fenced block is render-back verified
(`decisions/0016`); raw HTML is emitted as fenced text, never markup
(`decisions/0028`). The bundle (`packages/core/src/bundle/`) writes canonical
JSON files and a hand-rolled STORE-only deterministic ZIP (`decisions/0029`);
`manifest.json` separates content identity (hashes) from event metadata
(timestamp) per `decisions/0017`.

The detector/adapter seam contracts (`ComponentDetector`, `Adapter`,
`DETECTOR_PRIORITY`, the registries) live in `packages/core/src/seam.ts` —
DOM-typed but implementation-free — so `detectors` and `adapters` depend only
on `core`, and `pipeline` depends on `core` + `detectors` with no cycle.

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

Between step 7 (assemble + validate IR) and export, the **evaluate** stage
(`packages/core/src/evaluate/`, Phase 8) runs cross-stage fidelity assertions
(content present, code accounting `detected = exact + normalized + approximate

- failed`, citation/footnote resolution, and — when a fixture supplies an
expected outline — section retention), then derives the export status and a
`CompletenessReport` (`decisions/0031`). `capture()`runs it and returns`report` on the result; sentinel balance and render-back are enforced upstream
  in the pipeline / renderer.

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
