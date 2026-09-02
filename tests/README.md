# tests/

Cross-package integration tests — running the built extension against
locally served fixtures (`fixtures/html/`). Unit tests for a single package
live next to their source in `packages/*/src/*.test.ts` instead.

**Status: empty.** No integration behaviour exists to test yet. The first
real integration test is expected once Phase 4 (DOM capture and article
extraction) has a runnable pipeline. See `AGENTS.md` § verification protocol
for what these tests may and may not depend on (no live sites, no live AI
API calls).
