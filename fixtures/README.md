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

Each case also has `expected.md` (obsidian profile), `expected.gfm.md`,
`expected.commonmark.md`, and `expected-hashes.json` (Phase 7 — rendered
Markdown per profile + the content-identity hashes).

Regenerate goldens with `node scripts/capture-fixture.mjs --all --write`;
`tests/pipeline-*.test.ts` fail on any drift, non-determinism, or bundle-ZIP
instability.

`fixtures/code/<slug>/` has the same file set; its `source.html` is a full
page whose article body contains a code / terminal structure, so it exercises
`capture()` end to end (`captureKind === technical_article`).
`provenance.json` records the `category`.

`fixtures/conversations/<slug>/` holds synthetic ChatGPT-structured pages
(`captureKind === conversation`).

**Status: growing.** Phase 4: 8 `articles/*`. Phase 5: 13 `code/*`
(`semantic-html` / `prism` / `highlightjs` / `blocklevel-code` / `terminal` /
`adversarial`). Phase 6: 4 `conversations/*` + 3 `code/docusaurus-*`. Toward
the § 12 minimums (≥ 20 article fixtures incl. ≥ 5 **revision-pinned** real
Wikipedia articles; ≥ 50 individual code blocks): real Wikipedia captures and
the rest of the code corpus are added in Phases 7–10. Do not add a fixture
without a matching provenance record.
