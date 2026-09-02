# ai-docs/AGENTS.md — product capabilities and evidence boundaries

This file orients an agent to what `technical-clipper` is trying to prove and
where its evidence claims end. For process/protocol, see the repository-root
[`AGENTS.md`](../AGENTS.md); for why a constraint exists, see `decisions/`.

## The claim the MVP must prove

> On ordinary articles, supported technical pages, and the currently
> selected branch of a ChatGPT conversation, the primary content and its
> structure are retained; every supported code block is preserved exactly;
> and uncertainty or incompleteness is reported before export.

That is the whole product thesis. It is not an AI summariser and not a
general archival crawler.

## Current status (Phase 0)

None of this is implemented yet. Every package in `packages/` is a scaffold
that throws `NotImplementedError` on its placeholder entrypoints. There is no
DOM capture, no IR, no rendering, and no bundle output. Do not describe any
capture capability as working until its phase (`planning/ROADMAP.md`) is
`done` and its release gates (`planning/v0-to-mvp-planning-prompt.md` § 12)
pass.

## Evidence boundaries — the discipline that matters most

"Exact" is only meaningful relative to a named, observable source. When
reasoning about or implementing extraction:

- Exact `textContent` from an exposed copy-source node (e.g. a code block's
  underlying `<code>` element) is a different evidential claim from exact
  original HTTP response bytes. State which one is meant.
- A rendered/visual match (a screenshot, a "looks right" preview) is never
  proof of source-code fidelity. Only an asserted string and its hash prove
  that.
- Confidence levels (`exact`, `normalized`, `approximate`, `failed`, defined
  precisely once Phase 3 lands) exist so that uncertainty is reported, not
  hidden. Never let a partial extraction silently present as `exact`.
- Diagnostics carry severity, code, source location, a human message, and
  whether they block export. An agent implementing extraction should default
  to emitting a diagnostic over guessing.

## How an agent should orient itself here

1. Read `planning/CONTEXT.md` for the current resumption state.
2. Read `planning/ROADMAP.md` for phase status and dependencies.
3. Read the specific `planning/phase-N-*.md` plan for the phase in progress.
4. Check `decisions/` for any ADR touching the area being changed.
5. Never treat this file, `AGENTS.md`, or a Claude skill as authority to
   change actual capture/extraction behaviour directly — only reviewed,
   versioned, fixture-backed rules may do that (see
   `decisions/0002-deterministic-authority-path.md`).
