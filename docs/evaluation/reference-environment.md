# Reference environment for the timing gate (gate 15)

Gate 15: **capture + preview render must complete in under 2 seconds per
fixture** on a documented reference environment.

## Recorded environments

### Local development machine (2026-09-03)

|        |                                                      |
| ------ | ---------------------------------------------------- |
| CPU    | Intel Core i7-8650U @ 1.90 GHz (4 cores / 8 threads) |
| Memory | 17 GB                                                |
| OS     | Windows 11 (10.0.22621), x64                         |
| Node   | v22.5.1                                              |
| pnpm   | 9.12.0                                               |

Result of `pnpm gates` (gate 15), all 26 article + conversation fixtures:

- **worst case: `wikipedia-tail-call` at ~0.60 s** (344 KB source, 111 blocks,
  35 code blocks, 53 references)
- every other fixture well under 0.4 s
- threshold: 2.0 s — **PASS with >3× margin**

### CI runner (GitHub Actions `ubuntu-latest`)

`pnpm gates` runs on every push and pull request. The GitHub-hosted
`ubuntu-latest` runner (2 vCPU, 7 GB RAM at time of writing) is the pinned
reference for CI enforcement; the gate has passed on it for every commit since
it was introduced. If a future runner change pushes a fixture over 2 s, that is
a real regression to investigate, not a threshold to relax.

## Method

`scripts/gates.mjs` gate 15 times, per fixture: `captureFromHtml(...)` followed
by `renderMarkdown(document, { profile: 'gfm' })`, using `performance.now()`.
This is the same code path the extension's content script runs, minus the live
DOM clone (the fixture is parsed from HTML instead). The DOM-clone cost in a
real browser is bounded by page size and is not modelled here; the informal
Phase 9 measurement on representative pages stayed within budget.

## Notes

- Timing is measured on a warm process (the pipeline module is already loaded).
  Cold-start module load adds a fixed ~150 ms that is not attributable to any
  single capture.
- The 2 s budget is for capture + preview, not for bundle assembly + download,
  which the user triggers separately and which is not on the interactive path.
