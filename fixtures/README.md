# fixtures/

Offline fixture corpus used by unit and integration tests. Nothing here
depends on a live website — see `AGENTS.md` § verification protocol.

- `html/` — saved source HTML (synthetic, minimized from a real page, or
  retained under an appropriate licence/permission).
- `expected-ir/` — expected typed IR output for each fixture.
- `expected-markdown/` — expected rendered Markdown output for each fixture.
- `provenance/` — per-fixture provenance: origin (synthetic / minimized /
  licensed), and for Wikipedia-derived fixtures the exact revision URL,
  revision ID, retrieval date, licence, and required attribution.

**Status: empty.** The MVP fixture corpus (at least 20 article fixtures and
50 individual code-block fixtures per
`planning/v0-to-mvp-planning-prompt.md` § 12) is built up phase by phase,
starting once Phase 3–6 need fixtures to test against. Do not add a fixture
without a matching provenance record.
