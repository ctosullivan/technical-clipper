# AGENTS.md — technical-clipper working contract

This file is the canonical, tool-neutral contract for any agent (human or AI)
working in this repository. It is authoritative. The full original brief is
preserved verbatim at `planning/v0-to-mvp-planning-prompt.md`; if this file
and that document ever appear to conflict, treat it as a documentation bug
and raise it rather than silently picking one.

## What this is

`technical-clipper` is a local-first browser extension that captures
code-heavy technical pages, ordinary articles (including Wikipedia-style
pages), and the current branch of a ChatGPT conversation into deterministic
Markdown and a structured capture bundle. It is a deterministic web document
compiler with strong code awareness, not an AI summariser and not a general
archival crawler. Obsidian is the first export target.

## Non-negotiable constraints

Treat these as settled. If implementation evidence contradicts one, stop and
ask before changing it — do not quietly reinterpret it. Each has a
corresponding ADR in `decisions/`.

1. Local-first, offline-capable; no account, hosted API, or telemetry for
   ordinary capture; no network requests during extraction (`decisions/0001`).
2. Deterministic authority path — AI may propose adapters/ClipSpec patches,
   but only reviewed, versioned rules with passing fixtures may change
   capture or extraction behaviour (`decisions/0002`).
3. Capture into a typed document/conversation IR first; validate it; render
   every output (Markdown, bundle) from that IR (`decisions/0003`).
4. Code is a source artifact: exact text, indentation, blank lines, language,
   filename/caption, tab-group relationships, extraction method, confidence,
   and hashes are preserved; unsupported/partial extraction produces
   diagnostics, never a silently-approximate "exact" claim (`decisions/0004`).
5. General extraction (a Defuddle-style extractor) for ordinary content, plus
   narrow component detectors/adapters for exceptional structures. Standard
   semantic articles, including Wikipedia, go through the general path — no
   Wikipedia-only scraper (`decisions/0005`).
6. Reproducible outputs: canonical JSON ordering, documented normalization,
   stable hashes, deterministic Markdown and ZIP entry order/metadata,
   wherever byte-for-byte reproducibility is claimed (`decisions/0006`).
7. Browser scope: Chromium Manifest V3 only for the MVP. Firefox, Safari,
   mobile, and a native Obsidian plugin are deferred (`decisions/0007`).
8. ChatGPT scope: capture only the currently selected, fully loaded branch —
   never hidden branches, deleted edits, or internal reasoning
   (`decisions/0008`).
9. Security boundary: captured HTML/metadata is untrusted. Never execute
   captured code, inject unsanitized page HTML into extension pages, persist
   secrets, or request browser permissions beyond what the action needs
   (`decisions/0009`).

## Non-goals (MVP)

Hosted schema registry/backend, AI extraction/summarisation/auto-repair,
accounts/analytics/telemetry, Monaco/CodeMirror/Jupyter/virtualised editors,
cross-origin iframe traversal, canvas/screenshot/OCR code recovery, hidden
ChatGPT branches, authenticated-attachment or generated-image downloading,
local image mirroring, WARC/full archival capture, a visual rule editor,
automatic schema/adapter updates, a dedicated Obsidian plugin, and
non-Chromium platforms. Expanding any of these requires a new ADR, not an
in-flight scope decision.

## Working protocols

**Plan before implementation.** Before writing production code for a phase,
create `planning/phase-N-<name>.md` with: status, goal/user-visible outcome,
scope, explicit deferrals, dependencies/assumptions, settled design
decisions, files to add/change with one-line purposes, implementation
sequence, test fixtures/edge cases, runnable verification commands and
expected outcomes, documentation/ADR/changelog effects, stop-and-ask
conditions, and completion evidence to record. Do not start the phase until
the plan exists and materially-affecting assumptions are settled.

**Roadmap and context.** `planning/ROADMAP.md` is the complete phase table —
update it whenever phase status or scope changes. `planning/CONTEXT.md` is a
single current resumption checkpoint (active phase/status, last completed
work, unresolved decisions, verification state, working-tree state, next
concrete action) — overwrite it at every stopping point; it is not a log.
History lives in git and `CHANGELOG.md`.

**Documentation sync.** Update `docs/` (current user-visible behaviour),
`architecture/` (current implemented design, not aspiration), `decisions/`
(append-only ADRs), `planning/ROADMAP.md`/`CONTEXT.md`, and `CHANGELOG.md`
(`[Unreleased]`, Keep a Changelog categories) in the same commit as the
behaviour change. Never describe a planned capability as implemented.

**ADRs.** Sequential `decisions/NNNN-short-title.md` with Status, Context,
Decision, Alternatives considered, Consequences, and
Supersedes/Superseded-by when applicable. Never edit an accepted ADR to
conceal a reversal — add a superseding ADR.

**Definition of done, per phase:** scoped implementation complete; the
phase plan's verification commands pass; negative/boundary cases are
tested, not just the happy path; changed core logic is reviewed directly,
not only tested; user docs and living architecture are current; ADRs exist
for non-obvious decisions; `CHANGELOG.md` has a phase entry under
`[Unreleased]`; `ROADMAP.md` marks the phase `done`; `CONTEXT.md` records
verified state and next step; no unplanned file changes or scope creep.

**Commit and release.** One logical phase/change per commit; message format
`type(phase-N): concise summary`; no AI co-author/attribution trailers; do
not fold later phases into the current one because they look easy; the MVP
is one milestone, not one release per phase; promote `[Unreleased]` and tag
only after the final release gate passes and the user explicitly approves;
prefer additive commits and `git revert` over rewriting shared history.

**Verification.** Unit tests use saved local fixtures, never live sites.
Integration tests may run the built extension against locally served
fixtures. No test calls a live AI API. Any network-dependent smoke test is
clearly marked and excluded from the default suite. Run formatting, linting,
type checking, unit tests, integration tests, bundle build, and manifest
validation as applicable, then independently inspect the changed core logic
and changed-file list — green tests alone are not proof of correct scope.
Every bug found during implementation gets a regression fixture where
practical.

## Stop-and-ask conditions

Pause rather than guess when: existing repo content conflicts with this
contract or the source prompt; a final public product/package name is
needed and no safe placeholder works; a dependency licence or fixture
provenance is unclear; a requested permission would expose more than the
current action requires; the Obsidian handoff can't reliably handle the
planned content size; ChatGPT DOM access can't establish message
completeness/roles from stable evidence; a normalization would change code
bytes while still being labelled `exact`; a phase would expand an explicit
non-goal; tests pass but direct review finds an untested or contradictory
path; or the next step is publishing, pushing, signing, tagging, or store
submission.

## Orientation

- `planning/v0-to-mvp-planning-prompt.md` — original authoritative brief.
- `planning/ROADMAP.md` — phase table and status.
- `planning/CONTEXT.md` — current resumption checkpoint, read this first.
- `decisions/` — ADRs, historical why.
- `architecture/overview.md` — current + target design.
- `ai-docs/` — product capabilities and evidence boundaries for agents.
