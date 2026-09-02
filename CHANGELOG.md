# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
