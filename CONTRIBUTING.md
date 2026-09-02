# Contributing

This repository follows the working contract in [`AGENTS.md`](AGENTS.md) —
read it before making any change. This document is a short practical
summary; `AGENTS.md` is authoritative if the two ever disagree.

## Setup

```sh
pnpm install
pnpm run ci
```

`pnpm run ci` runs format-check, lint, typecheck, build, and test — the same
checks CI runs. Use `pnpm run ci`, not `pnpm ci` — pnpm reserves the bare
`ci` subcommand for itself.

## Before writing production code for a phase

Create `planning/phase-N-<name>.md` with the fields listed in `AGENTS.md` §
"Plan before implementation", and do not start implementing until it exists
and any materially-affecting assumptions are settled.

## Definition of done

A phase (or a smaller change within an already-planned phase) is done only
when every item in `AGENTS.md` § "Definition of done, per phase" is true —
including negative/boundary-case tests, a direct review of changed core
logic (not just green tests), current docs/architecture, an ADR for any
non-obvious decision, and updated `CHANGELOG.md` / `ROADMAP.md` / `CONTEXT.md`.

## Commits

- One logical phase/change per commit.
- Message format: `type(phase-N): concise summary`.
- No AI co-author or attribution trailers.
- Prefer additive commits and `git revert`; do not rewrite shared history.

## ADRs

Record non-obvious decisions as `decisions/NNNN-short-title.md` with Status,
Context, Decision, Alternatives considered, Consequences, and
Supersedes/Superseded-by when applicable. Never edit an accepted ADR to
conceal a reversal — add a new ADR that supersedes it.

## Governance files

`AGENTS.md` and `CLAUDE.md` are protected: any material change to either
must be shown as a diff and explicitly approved by the user before it's
written.
