# 0027. Docusaurus tab groups are a component detector, not a site adapter

## Status

Accepted (Phase 6). Refines the Phase 1 plan's "Docusaurus tab-group adapter"
wording.

## Context

`planning/v0-to-mvp-planning-prompt.md` § 4 requires "Docusaurus-style tabbed
code examples, retaining every accessible alternative and its label", and the
Phase 6 plan placed this in `packages/adapters`. `decisions/0013` defines the
seam: **detectors** are pure DOM readers that emit `CodeBlockIR` /
`CodeGroupIR` / `TerminalSessionIR` and participate in the fixed priority
table (`codeGroup: 30`); **adapters** run after general extraction to
reorganize blocks or supply conversation structure.

## Decision

The Docusaurus tab group is handled by a **`ComponentDetector`**
(`code/docusaurus-tabs` in `packages/detectors/src/docusaurus.ts`), priority
`DETECTOR_PRIORITY.codeGroup` (30), emitting `kind: 'code-group'` /
`CodeGroupIR`.

Rationale: a `<Tabs>` widget is a **DOM structure pattern** local to a region
of the page, exactly what a detector is for. Making it a detector means:

- it slots into the existing sentinel + overlap-resolution machinery — the
  group (priority 30) automatically wins over the individual `code/prism` (20)
  / `code/pre-code` (10) detectors for the same subtree;
- it works identically in an article body and inside a ChatGPT message (the
  message-block walker runs the same detector set);
- no new "site adapter" concept or "exactly one site adapter" bookkeeping is
  needed for the MVP.

### Grouping rules

- Container: `.tabs-container` / `.theme-tabs` / `[data-tabs]`, or a bare
  `[role="tablist"]` whose parent also holds `[role="tabpanel"]`s. Requires
  ≥ 2 panels.
- Per panel: label from the matching `[role="tab"]` / `.tabs__item` button
  (else `data-label`, else `Tab N`); code from the panel's first `<pre>` via
  `buildCodeBlock` (exact text, chrome stripped).
- A panel with **no** `<pre>` is **not** made a member; an `info`
  `TC-ADAPT-GROUP-NONCODE` diagnostic records the omission (§ 4 asks for code
  alternatives specifically).
- `defaultMemberIndex` = the index of the tab marked `aria-selected="true"` or
  `.tabs__item--active`, else `null`.
- `groupKind: 'docusaurus-tabs'`.

## Alternatives considered

- **A `packages/adapters` site adapter** — rejected: it would need its own
  post-extraction hook, its own overlap handling against the code detectors,
  and the "one site adapter per capture" rule from `decisions/0013`, for no
  benefit over a detector.
- **Flatten tabs into consecutive labelled code blocks in the extractor** —
  rejected by § 9 anti-patterns ("flattening tab alternatives"): the group
  relationship must be preserved in the IR (`CodeGroupIR`).

## Consequences

- `standardDetectors` gains `docusaurusTabsDetector`; `packages/adapters` holds
  only the ChatGPT conversation adapter + the ClipSpec seam.
- Fixtures: `fixtures/code/docusaurus-{two-tabs,five-tabs,noncode-tab}`.
- The Phase 6 plan's "Docusaurus adapter" bullets are satisfied by this
  detector; `CHANGELOG.md` notes the placement.
