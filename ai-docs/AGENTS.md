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

## Current status (Phase 10 — MVP candidate)

All ten roadmap phases are `done`. The pipeline captures article and
conversation pages end to end; the Chromium MV3 extension is a loadable
unpacked build. Release gates 1–15 (`decisions/0020`, run via `pnpm gates`)
pass, the fixture corpus meets § 12, and the security review + comparative
benchmark are in `docs/evaluation/`. The MVP is **not tagged or published** —
that is a separate explicit approval step. Still: do not describe a capability
as working beyond what a `done` phase and a passing gate actually demonstrate.

Live contracts (no longer "planned"):

- IR family + provenance/confidence — `packages/core/src/ir/`, `provenance.ts`,
  `decisions/0011`, `0012`.
- Diagnostics registry + export gate — `packages/core/src/diagnostics/`,
  `decisions/0015`.
- Canonical JSON / normalization / hashing / fence — `packages/core`,
  `decisions/0016`.
- Renderer profiles + degrade table — `packages/core/src/render/`,
  `decisions/0019`, `0028`, `0030`.
- Bundle contract — `packages/core/src/bundle/`, `decisions/0017`, `0029`.
- Detector/adapter seam + sentinels — `packages/core/src/seam.ts`,
  `packages/pipeline/src/sentinels.ts`, `decisions/0013`.
- Completeness report — `packages/core/src/evaluate/`, `decisions/0031`.

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
  in `packages/core/src/provenance.ts`) exist so that uncertainty is reported,
  not hidden. Never let a partial extraction silently present as `exact`.
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
