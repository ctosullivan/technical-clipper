# Phase 3 — Core IR, provenance, normalization, and hashing

## Status

done

## Completion evidence

- **Modules** (`packages/core/src/`): `ir/{nodes,code,article,conversation,document,index}.ts`,
  `provenance.ts`, `diagnostics/{registry,status,index}.ts`, `canonical.ts`,
  `normalize.ts`, `ids.ts`, `hash.ts`, `fence.ts`, `validate.ts`, `index.ts`;
  `__fixtures__/build.ts` (test-only IR builders).
- **Tests:** `canonical.test.ts` (8), `normalize.test.ts` (11), `ids.test.ts`
  (5), `hash.test.ts` (4, incl. known-answer SHA-256 vectors),
  `fence.test.ts` (14, sharing the fence table with the Phase 2 verifier —
  `decisions/0021`), `diagnostics/diagnostics.test.ts` (9), `validate.test.ts`
  (9), `index.test.ts` (3, incl. the walking-skeleton IR→canonical→hash→fence
  test). Total ~71 tests; `pnpm run ci` green
  (`format:check`, `lint`, `tsc -b`, tests, `skill:verify`).
- **Scaffold cleanup:** `CORE_PACKAGE_STATUS` removed; `NotImplementedError` /
  `notImplemented` kept and still consumed by the `detectors` / `adapters`
  scaffolds (replaced in Phases 5–6). `index.test.ts` rewritten.
- **Deferred as planned:** no DOM, detectors, adapters, renderer, or bundle;
  `mathBlock` TeX recovery, sentinel-balance and completeness assertions
  (Phases 4/8).
- **Doc sync:** `architecture/overview.md` (current state + `core` row),
  `docs/capture-format.md`, `packages/core/package.json` description,
  `CHANGELOG.md`.
- **Commit:** see `planning/CONTEXT.md`.

The scope and plan below are the original Phase 1 statement, retained for
context.

## Goal and user-visible outcome

`packages/core` stops being a scaffold and becomes the browser-independent
foundation every later phase builds on: the typed IR family, provenance /
confidence contracts, the diagnostics model, canonical serialization,
normalization rulesets, node-id computation, hashing, and fence selection —
all pure functions with deterministic unit tests. No capture behaviour yet; no
user-visible change beyond `@technical-clipper/core` exporting real types and
functions instead of `NotImplementedError`.

## Scope covered

- TypeScript types for `DocumentIR`, `ArticleIR`, `ConversationIR`,
  `MessageIR`, every `BlockNode` / `InlineNode` variant, `CodeBlockIR`,
  `CodeGroupIR`, `TerminalSessionIR`, and article sub-contracts
  (`FootnoteDefinition`, `ReferenceEntry`, `TableIR`, `ImageRef`,
  `RemovedRegion`, `ArticleRootProvenance`, `BranchEvidence`, `AttachmentRef`,
  `PageLoadState`) — exactly `decisions/0011`.
- `Provenance`, `EvidenceSource`, `Confidence` types + the enforcement
  predicates from `decisions/0012`.
- `Diagnostic` type + the diagnostics **registry** and `deriveExportStatus()`
  from `decisions/0015`.
- `canonicalize(value)` (compact + pretty), the normalization ruleset registry
  (`norm/prose@1`, `norm/code@1`, `norm/infostring@1`), `computeNodeId(seed)`
  - per-node seed builders, `computeHash(bytes)`, the `HashSet` assembler, and
    `selectFence(codeBlock)` — exactly `decisions/0014` and `0016`.
- `validateDocumentIR(doc): Diagnostic[]` — schema + cross-field rules
  (confidence/evidence legality, global id uniqueness, sentinel-leaf balance
  is checked later in the pipeline, not here).
- A throwaway "walking skeleton" test (see risk note in `ROADMAP.md`): a
  hand-built minimal `DocumentIR` → `canonicalize` → hash → assert stable, and
  a stub Markdown string walk, to de-risk the pipeline shape. Kept as a test,
  not shipped as a renderer.

## Explicit deferrals / non-goals

- No DOM, no `jsdom`, no detectors, no adapters, no renderer, no bundle.
- No Markdown _rendering_ (Phase 7) — only `selectFence` + the fence unit
  tests live here.
- No completeness assertions that require multiple pipeline stages (Phase 8).
- `mathBlock` TeX recovery logic is out of scope; the type exists, producers
  come later.

## Dependencies and assumptions

- Depends on Phase 1 (ADRs 0011–0020) and Phase 2 (fence/whitespace guidance
  cross-checked against the skill references).
- Assumes Node 20 + Vitest from `decisions/0010`.
- Assumes no runtime dependency is needed for hashing (Node `crypto`) or
  canonical JSON (hand-rolled per `0016`). Any dependency added here gets an
  ADR.

## Design decisions already settled

`decisions/0011` (IR family + kinds), `0012` (provenance/confidence),
`0014` (node ids), `0015` (diagnostics + export status), `0016`
(canonical JSON, normalization, hashing, fence selection). This phase is their
implementation, not a redesign.

## Files to add/change

| Path                                        | Purpose                                                                       |
| ------------------------------------------- | ----------------------------------------------------------------------------- |
| `packages/core/src/ir/document.ts`          | `DocumentIR`, `SourceMetadata`, `captureKind`                                 |
| `packages/core/src/ir/article.ts`           | `ArticleIR` + article sub-contracts                                           |
| `packages/core/src/ir/conversation.ts`      | `ConversationIR`, `MessageIR`, `BranchEvidence`, `AttachmentRef`              |
| `packages/core/src/ir/nodes.ts`             | `BlockNode` / `InlineNode` discriminated unions                               |
| `packages/core/src/ir/code.ts`              | `CodeBlockIR`, `CodeGroupIR`, `TerminalSessionIR`                             |
| `packages/core/src/provenance.ts`           | `Provenance`, `EvidenceSource`, `Confidence` + predicates                     |
| `packages/core/src/diagnostics/registry.ts` | Diagnostic code registry                                                      |
| `packages/core/src/diagnostics/status.ts`   | `deriveExportStatus()`                                                        |
| `packages/core/src/canonical.ts`            | `canonicalize()` compact + pretty                                             |
| `packages/core/src/normalize.ts`            | ruleset registry + `norm/*` implementations                                   |
| `packages/core/src/ids.ts`                  | `computeNodeId()` + seed builders                                             |
| `packages/core/src/hash.ts`                 | `computeHash()`, `HashSet` assembler                                          |
| `packages/core/src/fence.ts`                | `selectFence()`                                                               |
| `packages/core/src/validate.ts`             | `validateDocumentIR()`                                                        |
| `packages/core/src/index.ts`                | Re-export the public surface; drop the scaffold stubs                         |
| `packages/core/src/**/*.test.ts`            | Unit tests per module                                                         |
| `packages/core/src/__fixtures__/`           | Small hand-built IR fixtures for canonical/hash/id tests                      |
| `decisions/00NN-*.md`                       | Only if an implementation detail forces a new decision (e.g. a dependency)    |
| `architecture/overview.md`                  | Replace the `core` "scaffold" description with the real surface               |
| `docs/capture-format.md`                    | Note that `document.json` = canonical `DocumentIR`; full bundle still Phase 7 |
| `CHANGELOG.md`                              | `[Unreleased]` Phase 3 entry                                                  |

## Implementation sequence

1. Types first (`ir/*.ts`, `provenance.ts`) — compile with `strict`, no `any`,
   exhaustive `switch` on every union via a `never` guard.
2. `canonical.ts` + tests: key ordering, number formatting, compact vs pretty,
   `undefined` omission, control-char escaping, idempotence.
3. `normalize.ts` + tests: `norm/prose@1` each rule in isolation and combined;
   `norm/code@1` proves it changes nothing but a BOM and records line-ending
   state; `norm/infostring@1` alias table.
4. `ids.ts` + tests: determinism, stability under sibling reorder, code-id
   content-addressing, collision suffixing.
5. `hash.ts` + tests: per-code-block, per-message, content-identity view
   (timestamp excluded), markdown-bytes; known-answer vectors.
6. `fence.ts` + tests: backtick runs, tilde runs, mixed, minimum length,
   char switch rule, info-string highlight suffix.
7. `diagnostics/registry.ts` + `status.ts` + tests: the full derivation table
   from `0015`, every row.
8. `validate.ts` + tests: valid doc passes; each invalid shape yields the
   expected diagnostic (unknown node type, `exact` on reconstruction source,
   missing `evidenceSource`, duplicate id, schema-version too high).
9. Walking-skeleton test.
10. `index.ts` surface; delete scaffold `NotImplementedError` path (keep the
    export name if `detectors`/`adapters` still import it, else remove and
    update them).
11. Update `architecture/overview.md`, `docs/capture-format.md`,
    `CHANGELOG.md`.
12. Direct review of `normalize.ts`, `ids.ts`, `hash.ts`, `validate.ts` line
    by line against `0012`/`0014`/`0016`.
13. `pnpm run ci`.
14. If authorized, commit `feat(phase-3): core IR, provenance, normalization,
hashing`.

## Test fixtures and edge cases

- Empty article (no blocks) — validates, status `partial` via a
  `TC-ASSEMBLE-*` "no content" diagnostic.
- Two paragraphs with identical text under the same parent — distinct ids via
  ordinal.
- Code block: with final newline / without / BOM-prefixed / containing
  ` ` ```` and `~~~` runs / empty string.
- Message array out of `order` — validation diagnostic.
- Canonical JSON with keys needing code-point (not UTF-16) ordering
  (astral-plane key) — deterministic.
- Confidence `exact` + `evidenceSource: dom-rendered-reconstruction` — rejected.
- Hash content-identity: two docs differing only in `captureTimestamp` →
  identical `documentContentIdentity`.

## Runnable verification and expected outcomes

```sh
pnpm run ci   # expect green; core test count jumps substantially
pnpm --filter @technical-clipper/core test -- --coverage
              # expect: ids.ts / normalize.ts / hash.ts / canonical.ts /
              #         fence.ts / status.ts at or near 100% branch coverage
```

## Documentation / ADR / changelog effects

- `architecture/overview.md`: `core` row + current-state section rewritten to
  the real surface; target section trimmed of what is now implemented.
- `docs/capture-format.md`: `document.json` definition firmed up.
- `CHANGELOG.md` `[Unreleased]`: Phase 3 entry.
- New ADR only if an implementation detail demands one.
- `ROADMAP.md` Phase 3 → `done`; `CONTEXT.md` → Phase 4.

## Stop-and-ask conditions specific to this phase

- A normalization rule as specified in `0016` proves impossible to implement
  without changing code bytes — stop (this would be a real contradiction of a
  fixed constraint).
- Canonical JSON can't be made idempotent for some value class — stop.
- The IR shape from `0011` proves unrepresentable for a required article
  feature discovered while writing types — update `0011` via a superseding ADR
  before continuing.
- A third-party dependency seems necessary in the deterministic path — ADR +
  confirm before adding.

## Completion evidence to record

- Coverage numbers for the deterministic modules.
- Known-answer hash vectors committed as fixtures.
- The line-by-line review notes for `normalize`/`ids`/`hash`/`validate`.
- `pnpm run ci` output.
- Confirmation no DOM/detector/adapter/render code was added.
- Commit hash once authorized.
