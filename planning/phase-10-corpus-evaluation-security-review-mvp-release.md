# Phase 10 — Article/code corpus, comparative evaluation, security review, and MVP release

## Status

planned

## Goal and user-visible outcome

The MVP is provable and packaged. The fixture corpus reaches the § 12 minimums,
every release gate from `decisions/0020` runs as `pnpm run gates` (or is a
recorded manual check), a security review of the extension is complete, the
side-by-side comparative benchmark exists, documentation is current, and a
packaged unpacked extension is ready — at which point the phase **stops and
asks** for explicit approval to promote `[Unreleased]` and tag the MVP.

## Scope covered

- **Article corpus → ≥ 20** (`decisions/0020`): ≥ 5 revision-pinned Wikipedia
  (full provenance), ≥ 5 ordinary semantic articles (docs/reference/blog/news/
  guide), targeted cases (footnotes, repeated headings, fragment links,
  captions, nested lists, wide tables), ≥ 3 noisy pages, ≥ 3 malformed/
  ambiguous roots.
- **Code corpus → ≥ 50 blocks** across the 8 categories, including the
  adversarial set.
- **Conversation corpus** sufficient for the role/order gate (linear + branch
  - streaming + rich-content messages).
- **`pnpm run gates`**: a script mapping every automatable gate (1–15) in the
  `decisions/0020` table to a check with a pass threshold, runnable in CI on
  the pinned runner. Gate 15 (2-second capture+preview) times a representative
  set on the documented reference environment and records the machine spec.
- **Manual gates** (16 Obsidian vault render, 17 comparative benchmark):
  executed once per release candidate, evidence committed under
  `docs/evaluation/`.
- **Comparative benchmark** (`docs/evaluation/comparative/`): ≥ 3 cases where a
  current general-purpose clipping path corrupts/flattens/omits a supported
  case that this MVP preserves — input, our output, the other tool's output,
  and diff commentary.
- **Security review** (`security-review` skill + manual): untrusted-capture
  boundary, sanitizer coverage, permission scope, no-secret-persistence, no
  code execution, no network in capture; findings tracked to closure;
  `docs/privacy-and-security.md` finalized with a real reporting process.
- **Packaging**: `pnpm run package:extension` produces a versioned unpacked
  build (and a zip for manual install); no store submission.
- **Docs finalization**: `README.md` status → MVP; `docs/*` all current;
  `architecture/overview.md` current-state == implementation, target section
  trimmed to genuine post-MVP items; `ai-docs/AGENTS.md` points at the now-live
  contracts.
- **Roadmap/context/changelog**: all phases `done`; `CHANGELOG.md` MVP section
  prepared under `[Unreleased]` (not yet promoted).

## Explicit deferrals / non-goals

- Promoting `[Unreleased]` to a dated release and creating the MVP tag —
  **only after** explicit user approval (§ 16, `AGENTS.md` commit/release).
- Store submission, signing, publishing (non-goals / separate authorization).
- Any non-goal capability (Firefox, image mirroring, AI extraction, …).
- New product features discovered during evaluation → logged as post-MVP
  roadmap rows + ADRs, not built here.

## Dependencies and assumptions

- Depends on Phases 2–9 all `done`.
- Assumes fixture provenance can be satisfied: Wikipedia revisions are pinned
  by URL/ID under CC BY-SA 4.0 & GFDL with attribution; other real-page
  fixtures are minimized and licence/permission-cleared, else synthetic
  (`decisions/0020`, § 16).
- Assumes a documented reference environment for the timing gate (the CI
  runner spec is acceptable if recorded).
- Assumes a specific "current general-purpose clipping path" is available to
  benchmark against; if none can be used fairly, that is a stop-and-ask on
  gate 17's phrasing.

## Design decisions already settled

`decisions/0020` (corpus layout, gate→check map), `0006`/`0016`/`0017`
(determinism claims being verified), `0009` (security boundary),
`AGENTS.md` (release gate + explicit-approval-to-tag). New this phase: only
post-MVP roadmap ADRs for anything evaluation surfaces; the reference-environment
spec (recorded in `docs/evaluation/`, ADR if contested).

## Files to add/change

| Path                                                                    | Purpose                                                         |
| ----------------------------------------------------------------------- | --------------------------------------------------------------- |
| `fixtures/articles/**`, `fixtures/code/**`, `fixtures/conversations/**` | fill to § 12 minimums with provenance                           |
| `scripts/gates.mjs`                                                     | run all automatable release gates + thresholds                  |
| `scripts/fixture-lint.mjs`                                              | assert corpus completeness + provenance validity                |
| `package.json`                                                          | `gates`, `fixture-lint`, `package:extension` scripts            |
| `.github/workflows/ci.yml`                                              | run `fixture-lint` always; `gates` on PRs to the release branch |
| `docs/evaluation/README.md`                                             | how the gates + manual checks are run                           |
| `docs/evaluation/reference-environment.md`                              | machine spec for the timing gate                                |
| `docs/evaluation/obsidian-vault-check.md`                               | manual gate 16 evidence                                         |
| `docs/evaluation/comparative/**`                                        | gate 17 benchmark cases + commentary                            |
| `docs/evaluation/security-review.md`                                    | findings + resolutions                                          |
| `docs/privacy-and-security.md`                                          | finalize; real reporting process                                |
| `docs/capture-format.md`, `docs/cli-or-extension-reference.md`          | final pass                                                      |
| `architecture/overview.md`                                              | current-state == implementation; trim target section            |
| `ai-docs/AGENTS.md`                                                     | contracts now live; update pointers                             |
| `README.md`                                                             | status → MVP candidate                                          |
| `CHANGELOG.md`                                                          | assemble the MVP entry under `[Unreleased]` (not promoted)      |
| `planning/ROADMAP.md`, `planning/CONTEXT.md`                            | all phases `done`; next action = request release approval       |
| `decisions/00NN-*`                                                      | post-MVP roadmap items surfaced by evaluation (as needed)       |

## Implementation sequence

1. `fixture-lint.mjs` + wire to CI; it fails until the corpus is complete —
   use it as the checklist.
2. Fill the article corpus (Wikipedia first, with provenance), running each
   through the generic path; fix extraction bugs with regression fixtures per
   `AGENTS.md`.
3. Fill the code corpus to ≥ 50 across categories; fill the conversation
   corpus.
4. `gates.mjs`: implement gates 1–15 as checks with thresholds; get them green;
   any failure is a real bug → fix + regression fixture, not a threshold tweak.
5. Timing gate: run on the reference environment; record spec + numbers.
6. Manual gate 16: export a set to a test Obsidian vault, record screenshots +
   notes.
7. Gate 17: build the comparative benchmark cases + commentary.
8. Security review: run the `security-review` skill on the extension diff +
   manual review of the boundary; log findings; fix; re-review; write
   `docs/evaluation/security-review.md`.
9. Packaging: `package:extension` → versioned unpacked build + zip.
10. Documentation finalization pass across `docs/`, `architecture/`,
    `ai-docs/`, `README.md`.
11. Assemble the MVP `CHANGELOG.md` entry under `[Unreleased]`; mark all
    roadmap rows `done`; set `CONTEXT.md` next action to "request explicit
    approval to promote `[Unreleased]` and tag the MVP."
12. Direct review: the full changed-file list, the gate results, the security
    findings closure, and a re-read of § 1 / § 12 confirming the thesis is
    actually demonstrated by fixtures.
13. If authorized, commit `feat(phase-10): corpus, evaluation, security review,
MVP packaging`.
14. **Stop.** Present the release-gate evidence and ask for explicit approval
    before any tag/promotion (§ 16).

## Test fixtures and edge cases

- Every § 12 fixture family at or above its minimum, each with the full file
  set + valid provenance (Wikipedia: revision URL/ID, retrieval date, licence,
  attribution).
- Each release gate has at least one fixture that would fail it if the
  behaviour regressed (gates double as regression tests).
- Comparative benchmark: at least one code case (exact preservation vs
  flattening), one article case (section/citation retention vs omission), one
  code-group case (tab alternatives retained vs collapsed).
- Security: a fixture containing `<script>`, an `on*` handler, a
  `javascript:` URL, and an oversized data URI — none reach preview or
  `content.md`.

## Runnable verification and expected outcomes

```sh
pnpm run ci
pnpm run fixture-lint
   # expect: corpus complete; every provenance.json valid; WP cases have revisions
pnpm run gates
   # expect: gates 1-15 pass at threshold; timing gate under 2s on the
   #         recorded reference environment; report written
```

Manual: gate 16 (Obsidian vault) and gate 17 (comparative benchmark) evidence
present under `docs/evaluation/`; security review findings all closed.

## Documentation / ADR / changelog effects

- `docs/evaluation/` created and populated.
- `docs/privacy-and-security.md`, `docs/capture-format.md`,
  `docs/cli-or-extension-reference.md` finalized.
- `architecture/overview.md` current == built; target section trimmed.
- `ai-docs/AGENTS.md` updated to live contracts.
- `README.md` status → MVP candidate.
- `CHANGELOG.md` MVP entry assembled under `[Unreleased]`, **not** promoted.
- Post-MVP roadmap rows + ADRs for anything evaluation surfaced.
- `ROADMAP.md` all rows `done`; `CONTEXT.md` next action = request release
  approval.

## Stop-and-ask conditions specific to this phase

- Any release gate cannot be met without weakening a fixed constraint or a
  determinism/fidelity claim.
- Fixture provenance for a needed real-page case can't be cleared (licence /
  permission unclear) — use synthetic or drop the case, don't commit unclear
  material (§ 16).
- The security review finds an unresolved boundary issue.
- Gate 17 can't be run fairly against any real general-purpose clipper.
- The next step is tagging / promoting the release / store submission —
  **stop and get explicit approval** (§ 16, `AGENTS.md`).

## Completion evidence to record

- `pnpm run gates` full output + the timing numbers + reference-environment
  spec.
- Corpus inventory (counts per family) + `fixture-lint` pass.
- `docs/evaluation/` contents: Obsidian check, comparative benchmark, security
  review.
- The § 1 / § 12 thesis re-read confirming fixtures demonstrate it.
- Full changed-file review notes.
- Commit hash once authorized; **no tag** until separate explicit approval.
