# Phase 1 — Plan implementation through MVP

## Status

done

## Goal and user-visible outcome

Produce every implementation-ready plan needed to reach the MVP, before any
product capability is implemented. No user-visible product change — the
outcome is a resumable, reviewed, dependency-consistent set of planning
documents that Phase 2 onward executes against without re-deriving design
decisions mid-implementation.

## Scope covered

Per `planning/v0-to-mvp-planning-prompt.md` § 8, Phase 1 produces:

- `planning/phase-2-markdown-clipping-skill.md`.
- One complete `planning/phase-N-*.md` for every phase from 2 through 10
  (the MVP release phase), each containing every field required by
  `AGENTS.md` § "Plan before implementation."
- A refined `planning/ROADMAP.md` with final dependency order, milestone
  scope, status, and links to every plan.
- `planning/mvp-execution-plan.md`, describing how phases will be
  implemented, independently verified, documented, committed, resumed, and
  stopped when an assumption is unresolved.
- Any new ADRs needed to settle cross-phase architecture decisions —
  including, at minimum, the typed contracts listed in
  `planning/v0-to-mvp-planning-prompt.md` § 10 (`DocumentIR`, `ArticleIR`,
  `ConversationIR`, `MessageIR`, `CodeBlockIR`, `CodeGroupIR`,
  `TerminalSessionIR`, `ComponentDetector`/`Adapter` interfaces, detector
  precedence, stable block/message identifiers, diagnostics shape, canonical
  serialization/normalization, hashing boundaries, capture manifest
  versioning, capture/source kinds, adapter versioning and the ClipSpec
  override seam, export status levels) and the capture bundle contract
  questions in § 11.
- Updates to the target-design portion of `architecture/overview.md` where
  planning makes it more precise.
- An updated `planning/CONTEXT.md` naming Phase 2 as the next concrete
  action.

## Explicit deferrals / non-goals for this phase

- No feature implementation, no feature dependency installation.
- Phase 2 (or any later phase) does not begin because its plan looks
  straightforward — Phase 1 ends at the commit gate below and waits for
  review.
- Does not re-decide the fixed architectural constraints in
  `planning/v0-to-mvp-planning-prompt.md` § 2 unless implementation evidence
  (there is none yet, since nothing is implemented) contradicts one.

## Dependencies and assumptions

- Phase 0 is `done`, committed, and verified (workspace compiles, governance
  docs in place, ADRs 0001–0010 accepted).
- Assumes the fixed constraints and required contracts already stated in the
  source prompt are the starting point; Phase 1's job is to make them
  concrete and dependency-consistent, not to reopen them without cause.

## Design decisions already settled

None yet — settling cross-phase design decisions (typed contracts,
detector/adapter precedence, bundle contract, fixture strategy detail) is
this phase's deliverable, recorded as new ADRs and plan content.

## Files to add/change

- `planning/phase-2-markdown-clipping-skill.md` through
  `planning/phase-10-*.md` (9 new files).
- `planning/mvp-execution-plan.md` (new).
- `planning/ROADMAP.md` (refined in place).
- `planning/CONTEXT.md` (updated in place).
- `architecture/overview.md` (target-design section refined in place).
- `decisions/00NN-*.md` (new ADRs as cross-phase decisions are settled;
  exact count determined during the phase).

## Implementation sequence

1. Re-read `planning/v0-to-mvp-planning-prompt.md` in full; do not rely on
   summarized memory of it.
2. Draft the required core contracts (§ 10) and capture bundle contract
   decisions (§ 11) as ADRs — these are cross-phase and must be settled
   before phase plans that depend on them are written.
3. Draft each `planning/phase-N-*.md` in dependency order (2 → 10), each
   with every field `AGENTS.md` § "Plan before implementation" requires:
   status, goal, scope, deferrals, dependencies/assumptions, settled
   decisions, exact files, sequence, fixtures/edge cases, runnable
   verification commands and expected outcomes, doc/ADR/changelog effects,
   stop-and-ask conditions, completion evidence.
4. Draft `planning/mvp-execution-plan.md`: the resumable execution
   procedure — how a phase is picked up, verified, documented, committed,
   and how work stops cleanly on an unresolved assumption.
5. Review all phase plans together for: missing dependencies, circular
   ordering, oversized phases (a phase that isn't independently testable),
   contradictions between phases, work assigned before its contracts exist,
   and release criteria that cannot be measured. Revise plans as needed.
6. Refine `planning/ROADMAP.md` with final dependency order and links to
   every plan.
7. Update the target-design section of `architecture/overview.md` to match
   the now-concrete contracts.
8. Update `planning/CONTEXT.md` naming Phase 2 as the next concrete action.
9. Update `CHANGELOG.md` under `[Unreleased]` for the planning-only change.
10. Direct review confirming no product implementation leaked into Phase 1.
11. If authorized, commit as one documentation-only logical change,
    `docs(phase-1): plan implementation through MVP`, and stop for review.

## Test fixtures and edge cases

None — this is a planning-only phase with no product code. The equivalent
of "edge cases" here is the cross-phase review in step 5: every plan must be
checked against every other plan for the failure modes listed there.

## Runnable verification and expected outcomes

Since Phase 1 produces documentation only, verification is inspection-based,
plus the existing workspace checks to confirm no code regressed:

```sh
pnpm run ci   # expect: still green — Phase 1 must not touch product code
```

Plus a manual/reviewed checklist matching the Phase 1 done-criteria below.

## Documentation / ADR / changelog effects

- New ADRs for every cross-phase decision settled (contracts, bundle
  format, precedence rules, etc.).
- `architecture/overview.md` target-design section updated.
- `CHANGELOG.md` `[Unreleased]` entry: "Phase 1: complete MVP implementation
  plan."
- `planning/ROADMAP.md` and `planning/CONTEXT.md` updated to reflect
  completed planning.

## Stop-and-ask conditions specific to this phase

- Any Phase 2–10 plan cannot be made implementation-ready without a product
  decision the source prompt leaves open and that materially affects
  design (e.g. a required-but-unspecified contract shape).
- Circular or unresolved dependency ordering is found between two phases.
- A release gate (`planning/v0-to-mvp-planning-prompt.md` § 12) cannot be
  phrased as something a runnable command can check.
- Any of the general stop-and-ask conditions in `AGENTS.md` are triggered
  while drafting a plan (e.g. a licence/provenance question surfaces while
  designing the fixture strategy).

## Completion evidence

- **New files:** `decisions/0011`–`0020` (10 ADRs);
  `planning/phase-2-markdown-clipping-skill.md`,
  `planning/phase-3-core-ir-provenance-normalization-hashing.md`,
  `planning/phase-4-dom-capture-and-article-extraction.md`,
  `planning/phase-5-standard-code-extraction.md`,
  `planning/phase-6-structured-adapters.md`,
  `planning/phase-7-rendering-and-capture-bundle.md`,
  `planning/phase-8-validation-and-completeness-diagnostics.md`,
  `planning/phase-9-chromium-extension-and-obsidian-handoff.md`,
  `planning/phase-10-corpus-evaluation-security-review-mvp-release.md`,
  `planning/mvp-execution-plan.md`.
- **Modified:** `planning/ROADMAP.md`, `planning/CONTEXT.md`,
  `planning/phase-1-plan-mvp.md`, `architecture/overview.md`, `CHANGELOG.md`.
- **Cross-phase review notes + resolutions:** recorded in
  `planning/ROADMAP.md` § "Dependency-order rationale and cross-phase review"
  and summarised in `planning/CONTEXT.md`. Key points: order kept 0→10; the
  circular-looking 4↔5↔6 dependency is resolved by the detector/adapter seams
  (Phase 4 ships stubs, later phases fill them); every § 12 release gate is
  mapped to a runnable or recorded-manual check in `decisions/0020`; Phases 4
  and 7 are the largest and carry a "split and update the roadmap if
  un-shippable as one unit" instruction; the risk-first spike is a throwaway
  walking-skeleton test inside Phase 3, not a separate phase.
- **Verification:** `npx --yes pnpm@9.12.0 run ci` — green (`format:check`
  clean, `lint` 0 errors, `tsc -b` passes, 4 test files / 9 tests pass),
  unchanged from Phase 0.
- **No product implementation leaked into Phase 1** — confirmed explicitly:
  `git status` before the commit showed only `planning/`, `decisions/`,
  `architecture/overview.md`, and `CHANGELOG.md` changed; no file under
  `packages/`, `tests/`, or `fixtures/` was touched.
- **Commit:** `docs(phase-1): plan implementation through MVP` — see
  `planning/CONTEXT.md` for the hash.
