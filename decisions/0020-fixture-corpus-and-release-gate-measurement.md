# 0020. Fixture corpus layout and release-gate measurement

## Status

Accepted (Phase 1 planning). Corpus grows across Phases 4–9; gates enforced in
Phase 10.

## Context

§ 12 mandates a standard-article corpus (≥ 20 fixtures) and a code corpus
(≥ 50 blocks), a per-fixture file set, Wikipedia provenance requirements, and a
list of MVP release gates. § 8 requires that every release gate be phrased as
something a runnable command can check, or be explicitly marked manual with
recorded evidence. This ADR fixes the corpus layout and maps each gate to its
check so no later phase re-invents it.

## Decision

### Fixture layout

```
fixtures/
├── articles/<case-slug>/
│   ├── source.html
│   ├── expected-ir.json
│   ├── expected.md            # obsidian profile unless case notes say otherwise
│   ├── expected-diagnostics.json
│   ├── expected-hashes.json
│   └── provenance.json
├── code/<category>/<case-slug>/
│   └── (same file set; expected-ir.json holds the CodeBlockIR/GroupIR/TerminalIR)
└── conversations/<case-slug>/
    └── (same file set; expected-ir.json holds ConversationIR)
```

`provenance.json`: `{ origin: 'synthetic' | 'minimized-from-real' | 'licensed',
sourceUrl?, retrievedAt?, licence?, attribution?, revisionId?, revisionUrl?,
notes, producedByExtractorVersion, producedByAdapterVersions?,
producedByDetectorVersions? }`.

### Article corpus (≥ 20)

- ≥ 5 revision-pinned Wikipedia articles covering prose, deep section nesting,
  citations/references, infoboxes, wide tables, figures, lists. Each
  `provenance.json` records `revisionUrl`, `revisionId`, `retrievedAt`,
  `licence: "CC BY-SA 4.0 & GFDL"`, and the attribution string.
- ≥ 5 ordinary semantic articles: one each of documentation, API reference,
  long-form blog, news, and a framework guide (e.g. MDN-style, a docs site).
- Targeted cases: footnotes, repeated identical headings, in-page fragment
  links, figure captions, deeply nested lists, wide/irregular tables.
- ≥ 3 deliberately noisy pages: nav + cookie UI + related-content + edit
  controls + footer around a real article body.
- ≥ 3 malformed / ambiguous roots that must yield diagnostics and a
  non-`complete` status.

### Code corpus (≥ 50 blocks) across categories

`semantic-html`, `prism`, `highlightjs`, `docusaurus-tabs`, `blocklevel-code`,
`terminal`, `chatgpt-message`, `adversarial` (unsupported / ambiguous /
incomplete: Monaco-like virtualized editor, canvas-rendered code, truncated
block, code with backtick+tilde runs, mixed tabs/spaces, trailing-newline
present vs absent, BOM-prefixed).

### Determinism of fixture tests

No default test reads the network or a live site. A fixture-lint script
asserts: every case dir has the full file set; every `provenance.json`
validates; every Wikipedia case has revision fields; no `source.html` contains
`<script src="http`… pointing outward that a test would execute (it never
executes anyway). Fixtures for an adapter/detector are pinned to its version.

### Release-gate → check map

| #   | Gate (§ 12)                                                                                                  | Check                                                                                                                                                            | Type                            |
| --- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 1   | Supported articles retain every expected body block in source order                                          | `articles/*` IR block-sequence equality vs `expected-ir.json`                                                                                                    | auto                            |
| 2   | Heading hierarchy, links, lists, tables, figures/captions, footnotes/citations, references match expected IR | deep-equal on those IR sub-trees                                                                                                                                 | auto                            |
| 3   | Nav/edit/cookie/chrome/recommendations/footer absent from output                                             | assert none of the fixture's marked-noise selectors' text appears in IR; `RemovedRegion` present                                                                 | auto                            |
| 4   | All Wikipedia release fixtures pass the generic path (no WP adapter)                                         | run `articles/wikipedia-*` with adapter registry minus any WP adapter; must pass                                                                                 | auto                            |
| 5   | Article losing a section/citation target/figure cannot report `complete`                                     | completeness assertions (Phase 8) flip status; fixture `expected-diagnostics` + status asserted                                                                  | auto                            |
| 6   | 100% exact-text preservation for supported code fixtures                                                     | for every non-adversarial `code/*`: `CodeBlockIR.text` byte-equals `expected-ir` and `confidence === 'exact'` (or `'normalized'` where the case documents a BOM) | auto                            |
| 7   | 100% retention of accessible alternatives in supported code groups                                           | `CodeGroupIR.members` count + labels equal expected                                                                                                              | auto                            |
| 8   | Correct role and order for all ChatGPT message fixtures                                                      | `conversations/*` `messages[].role` / `.order` equal expected                                                                                                    | auto                            |
| 9   | Deterministic IR and Markdown for identical normalized input                                                 | run each fixture twice, assert identical IR JSON + Markdown bytes + hashes                                                                                       | auto                            |
| 10  | No line-number / copy-button contamination                                                                   | assert no fixture's known chrome strings (`Copy`, line-number sequences) in any `CodeBlockIR.text`                                                               | auto                            |
| 11  | Unsupported/partial components always produce the expected diagnostic                                        | `adversarial` cases: `expected-diagnostics.json` deep-equal; `confidence` is `approximate`/`failed`                                                              | auto                            |
| 12  | No network requests during capture tests                                                                     | test harness installs a `fetch`/`XMLHttpRequest`/`navigator.sendBeacon` trap that fails the test on call                                                         | auto                            |
| 13  | No executable content / unsafe HTML in preview                                                               | render preview for each fixture through the sanitizer; assert no `<script>`, no `on*` attr, no `javascript:` URL in output                                       | auto                            |
| 14  | Valid MV3 build, least-privilege permissions                                                                 | manifest schema validation + assert `permissions`/`host_permissions` ⊆ the documented allowlist                                                                  | auto                            |
| 15  | Capture+preview < 2 s on a documented reference environment                                                  | timed run over a representative fixture set in CI on the pinned runner; record the machine spec in `docs/evaluation/`                                            | auto (threshold) + recorded env |
| 16  | Exported Markdown renders acceptably in a test Obsidian vault                                                | manual checklist run once per release candidate; screenshots + notes in `docs/evaluation/obsidian-vault-check.md`                                                | manual, evidence recorded       |
| 17  | Side-by-side benchmark vs a general-purpose clipper on a case it corrupts                                    | `docs/evaluation/comparative/` holds input, our output, the other tool's output, and the diff commentary for ≥ 3 cases                                           | manual, evidence recorded       |

## Alternatives considered

- **Snapshot/screenshot gates for code fidelity** — rejected by § 12; strings
  and hashes are asserted directly.
- **Live Wikipedia fetch in CI with a cache** — rejected: § 12 forbids default
  tests depending on mutable live pages.
- **One giant fixture per category** — rejected: per-case dirs keep diffs and
  provenance auditable and let a single failing case be isolated.

## Consequences

- Phase 10's work is largely "fill the corpus to the minimums and turn the
  check map into a `pnpm run gates` script that CI runs."
- Each earlier phase adds only the fixtures it needs, in this layout, with
  provenance from day one.
- `docs/evaluation/` is created in Phase 10 to hold the manual-gate evidence.
