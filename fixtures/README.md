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

## Layout (`decisions/0020`)

```
fixtures/articles/<slug>/
├── source.html              # rendered-HTML input (byte-exact; prettier-ignored)
├── expected-ir.json         # golden DocumentIR (canonical pretty JSON, timestamp fixed)
├── expected-diagnostics.json# golden export status + diagnostics
└── provenance.json          # origin, sourceUrl, licence, (Wikipedia: revision fields)
```

Regenerate goldens with `node scripts/capture-fixture.mjs --all --write`;
`tests/pipeline-article.test.ts` fails on any drift or non-determinism.

**Status: growing.** Phase 4 added 8 `articles/*` fixtures (clean semantic
articles, a noisy page, a footnote/reference article, two synthetic
MediaWiki-structured pages, an ambiguous root, and a no-root failure case).
Toward the § 12 minimums (≥ 20 article fixtures incl. ≥ 5 **revision-pinned**
real Wikipedia articles, ≥ 50 code-block fixtures): real Wikipedia captures
and the code corpus are added in Phases 5–10. Do not add a fixture without a
matching provenance record.
