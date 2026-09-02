# MVP execution plan

How Phases 2–10 are picked up, implemented, verified, documented, committed,
resumed, and stopped cleanly. This is the procedure; the per-phase detail lives
in each `planning/phase-N-*.md`, and the authority for all of it is
`AGENTS.md` + `planning/v0-to-mvp-planning-prompt.md`.

## Ground rules

- **Roadmap order, one phase at a time.** No phase starts before the previous
  is `done` per the definition of done below. A later phase is never folded
  into the current one because it "looks easy" (`AGENTS.md` § commit/release).
- **Plans precede code.** Every phase already has an implementation-ready plan
  (Phase 1 output). A scope discovery updates the affected plan + `ROADMAP.md`
  transparently; it does not justify skipping the plan.
- **The MVP is one milestone.** No release per phase. `[Unreleased]` is
  promoted and the MVP tagged only after Phase 10's gates pass **and** the
  user explicitly approves (`AGENTS.md` § commit/release, § stop-and-ask).
- **No product code in a planning artifact; no AI in the runtime path**
  (`decisions/0002`).

## Per-phase loop

1. **Orient.** Read `planning/CONTEXT.md`, then `planning/ROADMAP.md`, then the
   target `planning/phase-N-*.md`, then every ADR it names. Confirm the
   previous phase is `done`.
2. **Settle assumptions.** Resolve every "stop-and-ask condition" and open
   assumption in the plan that materially affects design _before_ writing
   code. If a new cross-phase decision appears, write the ADR first.
3. **Implement in the plan's sequence.** Types/contracts before behaviour;
   deterministic core before anything DOM-facing; tests alongside each unit,
   not deferred.
4. **Add fixtures in the `decisions/0020` layout** as the phase needs them,
   each with `provenance.json` from creation. Wikipedia fixtures carry
   revision URL/ID, retrieval date, licence, attribution.
5. **Verify** (see the verification gate below).
6. **Review directly.** Read the changed core logic and the full changed-file
   list. Green tests are not proof of correct scope (`AGENTS.md` §
   verification). Record the review notes as completion evidence.
7. **Sync docs in the same change.** `docs/` (current user-visible behaviour),
   `architecture/overview.md` (move items from target → current; never
   describe planned work as done), `decisions/` (new ADRs), `CHANGELOG.md`
   (`[Unreleased]`, Keep a Changelog categories), `ROADMAP.md` (status),
   `CONTEXT.md` (overwrite the checkpoint).
8. **Commit** (if authorized): one logical phase per commit,
   `type(phase-N): concise summary`, no AI attribution trailers. Prefer
   additive commits + `git revert` over history rewrites.
9. **Stop for review** at the end of every phase. Report outcome, evidence,
   and the exact next action.

## Verification gate (run every phase, as applicable)

```sh
pnpm run ci   # format:check + lint + typecheck + build + test
```

Plus, per phase:

- **Phase 2:** `pnpm run skill:verify` (offline example/anti-example checks);
  discovery-prompt check; profile-correctness review.
- **Phase 3:** branch coverage at/near 100% for `canonical`, `normalize`,
  `ids`, `hash`, `fence`, `status`; known-answer hash vectors.
- **Phases 4–6:** fixture integration tests (`tests/pipeline-*.test.ts`);
  determinism (run each fixture twice → identical IR/Markdown/hashes); the
  network trap fires on no capture test.
- **Phase 7:** golden Markdown per profile (byte-equal); render-back
  verification; bundle determinism (two builds identical except
  `manifest.json`; content hashes identical across timestamps).
- **Phase 8:** every `expected-report.json` matches; no known-loss fixture
  reports `complete`; `canExport` false only for `failed`.
- **Phase 9:** `pnpm run build:extension` loads in Chromium;
  `tests/extension-*.test.ts`; downloaded bytes == `assembleBundle`; manifest
  permission set ⊆ allowlist; manual smoke test.
- **Phase 10:** `pnpm run fixture-lint`; `pnpm run gates` (1–15 at threshold,
  timing < 2 s on the recorded reference environment); manual gates 16–17
  evidence under `docs/evaluation/`; security review closed.

A bug found during implementation gets a regression fixture/test where
practical, in the same commit as the fix.

## Definition of done (per phase — from `AGENTS.md`)

All ten must hold (`AGENTS.md` § "Definition of done, per phase"):

- scoped implementation complete;
- the plan's verification commands pass;
- negative/boundary cases tested, not just the happy path;
- changed core logic reviewed directly, not only tested;
- user docs and living architecture current where applicable;
- ADRs exist for non-obvious decisions;
- `CHANGELOG.md` has a phase entry under `[Unreleased]`;
- `planning/ROADMAP.md` marks the phase `done`;
- `planning/CONTEXT.md` records the verified state and next step;
- no unplanned file changes or scope creep.

## Resuming after an interruption

`planning/CONTEXT.md` is the single source of resumption truth (active phase +
status, last completed work, unresolved decisions, exact verification state,
working-tree state, next concrete action). On resume:

1. Read `CONTEXT.md` → `ROADMAP.md` → the active `phase-N` plan → its ADRs.
2. Run `pnpm run ci` to establish the actual current state (don't trust memory
   of "it was green").
3. Check `git status` / `git log` against `CONTEXT.md`'s working-tree line.
4. Continue from `CONTEXT.md`'s "next concrete action". If it conflicts with
   what the tree shows, reconcile and rewrite `CONTEXT.md` before proceeding.

History lives in git + `CHANGELOG.md`; `CONTEXT.md` is never an append-only
log.

## Stopping cleanly on an unresolved assumption

When a stop-and-ask condition triggers (`AGENTS.md` § stop-and-ask, or a
phase-specific one):

1. Stop implementation at a compiling, test-green state if possible;
   otherwise revert the in-flight change so the tree is clean.
2. Write the open question into `CONTEXT.md` under "unresolved decisions" with
   enough context to decide, and set "next concrete action" to
   "resolve <question>, then resume phase N step M".
3. If the question is a cross-phase design decision, draft the ADR as
   `Proposed` with the alternatives, so approval is a one-word answer.
4. Report the blocker and the options. Do not guess past it.

## Cross-phase contract change procedure

If implementation evidence contradicts a settled contract (ADRs 0011–0020) or
a fixed constraint (`decisions/0001`–`0009`):

1. Stop (this is a stop-and-ask condition).
2. Write a **superseding** ADR — never edit the accepted one to hide the
   reversal (`AGENTS.md` § ADR protocol).
3. Update every phase plan that referenced the old contract, and `ROADMAP.md`.
4. Get approval before implementing against the new contract.

## Release (Phase 10 end only)

Promotion of `[Unreleased]` to a dated section and creation of the MVP tag
happen only after: all release gates pass or have recorded manual evidence,
the security review is closed, and the user has **explicitly approved release**
(`AGENTS.md`, § 16). Pushing, publishing, signing, and store submission are
each separately authorized, never assumed.
