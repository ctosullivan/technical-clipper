# tests/

Cross-package integration tests — running the built extension against
locally served fixtures (`fixtures/html/`). Unit tests for a single package
live next to their source in `packages/*/src/*.test.ts` instead.

`pipeline-article.test.ts` (Phase 4) and `pipeline-code.test.ts` (Phase 5) run
the built pipeline over every `fixtures/articles/*` / `fixtures/code/*` fixture
via `scripts/capture-fixture.mjs`, asserting the output matches the committed
golden files, is byte-identical across two runs, and satisfies the § 12
fidelity gates (exact code text, no chrome contamination, adversarial
diagnostics). They depend only on saved fixtures — no live sites, no AI API
calls (`AGENTS.md` § verification protocol).
