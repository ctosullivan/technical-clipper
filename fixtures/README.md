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

`fixtures/code/<slug>/` has the same file set; its `source.html` is a full
page whose article body contains a code / terminal structure, so it exercises
`capture()` end to end (`captureKind === technical_article`).
`provenance.json` records the `category`.

**Status: growing.** Phase 4 added 8 `articles/*` fixtures; Phase 5 added 13
`code/*` fixtures across `semantic-html` / `prism` / `highlightjs` /
`blocklevel-code` / `terminal` / `adversarial`. Toward the § 12 minimums
(≥ 20 article fixtures incl. ≥ 5 **revision-pinned** real Wikipedia articles;
≥ 50 individual code blocks): real Wikipedia captures and the rest of the code
corpus are added in Phases 6–10. Do not add a fixture without a matching
provenance record.
