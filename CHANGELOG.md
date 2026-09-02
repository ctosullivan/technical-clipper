# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Phase 1: complete implementation plan through the MVP (planning only, no
  product code).
  - `planning/phase-2-*.md` … `planning/phase-10-*.md` — implementation-ready
    plans for every phase to the MVP release, each with the full field set
    from `AGENTS.md` § "Plan before implementation".
  - `planning/mvp-execution-plan.md` — resumable per-phase execution,
    verification, documentation, commit, and stop-on-blocker procedure.
  - `decisions/0011`–`0020` — cross-phase ADRs settling the typed IR family,
    provenance/confidence semantics, detector/adapter interfaces and
    precedence, stable node identifiers, the diagnostics model and
    export-status levels, canonical serialization/normalization/hashing and
    fence selection, the capture bundle contract, the ClipSpec override seam,
    Markdown output profiles, and the fixture corpus / release-gate map.
  - `planning/ROADMAP.md` — refined dependency order, per-phase plan links,
    cross-phase ADR index, and the cross-phase review findings.
  - `architecture/overview.md` — target section made precise against ADRs
    0011–0020; `evaluate` stage and `packages/pipeline` added.
  - `planning/CONTEXT.md` — updated to name Phase 2 as the next concrete
    action.

- Phase 0: repository scaffolding and governance.
  - Workspace tooling: pnpm workspaces, TypeScript project references,
    ESLint (flat config) + Prettier, Vitest, GitHub Actions CI.
  - Minimal compiling packages: `@technical-clipper/core`,
    `@technical-clipper/detectors`, `@technical-clipper/adapters`,
    `@technical-clipper/extension` (zero-permission Manifest V3 shell), each
    with a scaffold test that fails loudly instead of faking real behaviour.
  - Governance documents: `AGENTS.md` (canonical working contract),
    `CLAUDE.md` (compatibility entrypoint), `CONTRIBUTING.md`,
    `README.md`.
  - `architecture/overview.md` — current Phase 0 state plus target
    architecture.
  - `decisions/0001`–`0010` — initial ADRs for the fixed architectural
    constraints and the Phase 0 toolchain selection.
  - `docs/capture-format.md`, `docs/cli-or-extension-reference.md`,
    `docs/privacy-and-security.md` — stubs, clearly labelling
    not-yet-implemented behaviour.
  - `ai-docs/README.md`, `ai-docs/AGENTS.md` — product-capability and
    evidence-boundary orientation for agents.
  - `planning/v0-to-mvp-planning-prompt.md` — durable copy of the original
    planning brief.
  - `planning/ROADMAP.md`, `planning/CONTEXT.md` — phase table and
    resumption checkpoint.
  - `planning/phase-0-repo-scaffolding.md`,
    `planning/phase-1-plan-mvp.md` — phase plans.
  - `fixtures/` and `tests/` skeleton directories with READMEs, empty
    pending real fixtures/integration tests in later phases.

<!--
  Version-comparison links will be added once a remote repository URL
  exists to link against — do not add a placeholder link.
-->
