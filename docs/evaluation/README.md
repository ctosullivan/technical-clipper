# Evaluation and release gates

This directory holds the evidence for the MVP release gates
(`decisions/0020` § "Release-gate → check map", planning prompt § 12).

## Automatable gates (1–15)

```sh
pnpm gates          # runs gates 1-15, exits non-zero on any failure
pnpm gates -- --json
```

`scripts/gates.mjs` re-derives each structural gate from the committed fixture
goldens (fast, no capture) plus a live determinism pass (gate 9) and a live
timing pass (gate 15). Gates 1–2 and 9 are additionally enforced byte-for-byte
by `scripts/capture-fixture.mjs --all`, which the pipeline tests run in CI.

| Gate | Summary                                       | Where enforced                                                              |
| ---- | --------------------------------------------- | --------------------------------------------------------------------------- |
| 1    | Body blocks retained in source order          | golden IR equality + `gates.mjs`                                            |
| 2    | Heading/list/table/figure/citation structure  | golden IR equality + `gates.mjs`                                            |
| 3    | Nav/edit/cookie/footer absent from output     | `gates.mjs` (noise-string scan + `RemovedRegion` present)                   |
| 4    | Wikipedia fixtures pass the generic path      | `gates.mjs` (5 revision-pinned, no WP adapter, status ≠ failed, code exact) |
| 5    | Section/citation/figure loss ⇒ not `complete` | `gates.mjs` (report status vs loss diagnostics)                             |
| 6    | 100% exact/normalized code text               | `gates.mjs` (per `CodeBlockIR.confidence`)                                  |
| 7    | Code-group alternatives retained              | `gates.mjs` (member counts)                                                 |
| 8    | ChatGPT role + order correct                  | `gates.mjs`                                                                 |
| 9    | Deterministic IR / Markdown / bundle bytes    | `gates.mjs` (double capture) + `capture-fixture.mjs`                        |
| 10   | No line-number / copy-button contamination    | `gates.mjs`                                                                 |
| 11   | Unsupported components ⇒ expected diagnostic  | `gates.mjs`                                                                 |
| 12   | No network during capture                     | `gates.mjs` (fetch/XHR trap) + `network-trap` in the pipeline               |
| 13   | No executable content in preview              | `gates.mjs` (renders every fixture, 3 profiles)                             |
| 14   | Valid MV3, least-privilege permissions        | `gates.mjs` + `packages/extension/src/manifest.test.ts`                     |
| 15   | Capture + preview < 2 s                       | `gates.mjs` timing pass, see `reference-environment.md`                     |

## Manual gates (16–17)

- **Gate 16 — Obsidian vault render:** `obsidian-vault-check.md`.
- **Gate 17 — comparative benchmark:** `comparative/`.

## Fixture corpus

```sh
pnpm fixture-lint   # completeness + provenance, prints the inventory
```

## Security review

`security-review.md` — untrusted-capture boundary, sanitizer coverage,
permission scope, no-secret-persistence, no code execution, no network.
