# tests/

Cross-package integration tests — running the built extension against
locally served fixtures (`fixtures/html/`). Unit tests for a single package
live next to their source in `packages/*/src/*.test.ts` instead.

`pipeline-article.test.ts` (Phase 4) runs the built pipeline over every
`fixtures/articles/*` fixture via `scripts/capture-fixture.mjs`, asserting the
output matches the committed golden files and is byte-identical across two
runs. It depends only on saved fixtures — no live sites, no AI API calls
(`AGENTS.md` § verification protocol).
