# article-citations — commentary

**Input:** `fixtures/articles/wikipedia-jwt/source.html` — the full read-view
HTML of the _JSON Web Token_ Wikipedia article at revision 1372553352
(461 KB, complete site chrome). Provenance in the fixture's `provenance.json`.

## Naive path (`naive.md`)

- The **interlanguage sidebar** ("Български, Català, Čeština, …") is emitted as
  a top-level bullet list — it out-scored nothing and readability kept it.
- The **infobox** leaks in as a broken one-column-then-two-column table
  (`| JSON Web Token |` / `| Abbreviation | JWT |` …).
- Every inline citation marker (`[1]`, `[2]`, …) is **gone** — turndown drops
  `<sup class="reference">`.
- The **References section is dropped entirely** (readability treats
  `.reflist` as boilerplate), so none of the 46 sources survive and there is
  no way to chase a claim back to its source.

## This pipeline (`ours.md`)

- Interlanguage list, edit links, navboxes, and the TOC are removed and
  recorded as `RemovedRegion`s.
- The infobox is kept as a single clean `table` node (`decisions/0024`).
- Inline `[n]` markers are preserved as `citationRef` inline nodes.
- All 46 reference entries are collected into `ArticleIR.references` with their
  source URLs; unresolved markers would raise `TC-EXTRACT-CITATION-UNRESOLVED`
  and force a non-`complete` status.
- Code blocks in the article (`{ "alg": "HS256", … }`, the signing
  pseudo-code, the bearer-token examples) are retained byte-exact.

## Caveat

This is a comparison against the readability + turndown path, not against a
specific shipping product. A pre-release spot check of the actual Obsidian Web
Clipper on these three inputs is listed as a manual step in
`obsidian-vault-check.md`.
