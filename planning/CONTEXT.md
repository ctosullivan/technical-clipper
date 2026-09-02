# Context — current resumption checkpoint

This file is a single current snapshot, not a log. Overwrite it at every
natural stopping point. History lives in git and `CHANGELOG.md` — see
`AGENTS.md` § "Roadmap and context".

## Active phase

Phase 1 — Plan implementation through MVP — status: **done**.
Next: Phase 2 (`planning/phase-2-markdown-clipping-skill.md`).

The user has authorised implementing the phase plans through to the MVP
(stopping only for genuine blockers and for the Phase 10 release-approval
gate). Implementation proceeds in roadmap order, one phase per commit.

## Last completed work

Phase 1 planning: `decisions/0011`–`0020` (cross-phase ADRs),
`planning/phase-2`…`phase-10` plans, `planning/mvp-execution-plan.md`,
refined `planning/ROADMAP.md`, `architecture/overview.md` target section,
`CHANGELOG.md` entry. Committed as `docs(phase-1): plan implementation through
MVP` (hash recorded below once made).

## Unresolved decisions

None blocking. Phase-local decisions (DOM library, article-root scoring,
language inference, sanitizer, ZIP writer, extension bundler, Obsidian handoff)
are deferred to their phase plans as named phase-local ADRs.

## Verification state

`pnpm` is not on PATH; use `npx --yes pnpm@9.12.0 <cmd>`.
`npx --yes pnpm@9.12.0 run ci` — green (`format:check` clean, `lint` 0 errors,
`tsc -b` passes, 4 test files / 9 tests). Unchanged from Phase 0.

## Working-tree state

Git repo on `master`. Phase 1 committed on top of `91d5409`. Nothing pushed,
tagged, or released.

## Next concrete action

Begin **Phase 2** per `planning/phase-2-markdown-clipping-skill.md`: retrieve
the § 9 official sources, write the skill + references + anti-pattern
catalogue + offline verifier, add `decisions/0021` (verifier parser choice),
wire `skill:verify` into CI, verify, commit `docs(phase-2): …`.
