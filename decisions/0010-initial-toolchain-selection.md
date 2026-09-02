# 0010. Initial toolchain selection

## Status

Accepted

## Context

Phase 0 needs a working, minimal TypeScript workspace before any product
decisions are made. These are reversible tooling choices, not architectural
commitments, but they still need to be recorded so later phases don't
re-litigate them without cause.

## Decision

- **Package manager:** pnpm workspaces (`pnpm-workspace.yaml`).
- **Language/build:** TypeScript with project references
  (`tsconfig.base.json` + per-package `tsconfig.json`), compiled with `tsc
-b`. No monorepo build orchestrator (Nx, Turborepo) yet — revisit via a new
  ADR once package count/build-graph complexity justifies one.
- **Test runner:** Vitest.
- **Lint/format:** ESLint (flat config, `typescript-eslint`) + Prettier.
- **Node version:** Node 20 LTS, declared in `.nvmrc` and `package.json`
  `engines`.
- **CI:** GitHub Actions (`.github/workflows/ci.yml`), scaffolded in Phase 0
  because it can already verify real invariants (format/lint/typecheck/
  build/test on the compiling scaffold) rather than placeholder assertions.
- **Extension bundler:** deferred to the Phase 9 plan; only the package
  layout (`packages/extension`) is fixed now.

## Alternatives considered

- **npm or Yarn workspaces** instead of pnpm — viable, but pnpm's stricter
  dependency isolation better matches "prefer minimal dependencies and pure
  functions in the deterministic path."
- **Jest** instead of Vitest — viable, but Vitest's native ESM/TS support
  avoids extra transform configuration for a pure-ESM workspace.
- **Biome** instead of ESLint+Prettier — viable single-tool alternative;
  ESLint+Prettier chosen for wider plugin ecosystem maturity as the project
  grows browser/MV3-specific lint needs.

## Consequences

- All later phases assume `pnpm <script>` at the workspace root and
  per-package `pnpm --filter <pkg> <script>` when needed.
- Changing any of these later is a normal ADR-superseding change, not a
  stop-and-ask condition, since none of them are product-facing.
