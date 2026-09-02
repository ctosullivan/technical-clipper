# Phase 6 — Structured adapters

## Status

planned

## Goal and user-visible outcome

Two narrow adapters plus the ClipSpec seam:

1. **Docusaurus tab-group adapter** — groups the individual code blocks
   Phase 5 detects inside a Docusaurus `<Tabs>` widget into a `CodeGroupIR`,
   retaining every accessible alternative and its label.
2. **ChatGPT current-branch conversation adapter** — produces a
   `ConversationIR` for the currently selected, fully loaded branch: message
   order, user/assistant roles, rich-text blocks, code blocks, tables,
   citations/links, visible attachment metadata; `branchEvidence` established
   from stable DOM signals or the capture fails.
3. **`resolveClipSpec(url)`** + schema validation + the effective-config merge
   (`decisions/0018`), with 1–2 example ClipSpecs used by the corpus.

Verified by adapter fixtures (`fixtures/conversations/*`,
`fixtures/code/docusaurus-tabs/*`); no UI.

## Scope covered

- `Adapter` implementations per `decisions/0013` (`appliesTo` pure + offline;
  `adapt` runs after general extraction, before sentinel restore).
- Docusaurus adapter: detect the tab container, associate each tab label with
  its panel's already-detected `CodeBlockIR`, emit a `codeGroup` block,
  record `defaultMemberIndex`, drop the now-redundant standalone blocks,
  `groupKind: 'docusaurus-tabs'`. Non-code tabs (prose alternatives) retained
  as labelled members only if they are code; otherwise an `info` diagnostic
  notes the omission.
- ChatGPT adapter:
  - Identify the conversation turn list and the **selected** branch (branch
    switchers like "‹ 2/3 ›" must read as showing the current branch; if the
    active branch can't be determined → fatal `TC-ADAPT-BRANCH`).
  - Per turn: role from stable evidence (author label, `data-message-author-role`
    if present, structural position) → `roleEvidence`; blocks via the same
    node builders as articles; code via Phase 5 detectors over the message
    subtree; tables, links, citations preserved; attachments →
    `AttachmentRef { state: 'not-downloaded' }`.
  - `branchEvidence`: records the signals used (turn count, branch-indicator
    text, absence of a "regenerating"/streaming indicator).
  - Streaming in progress → fatal (`decisions/0017`).
  - Hidden branches, deleted edits, internal reasoning → never claimed
    (`decisions/0008`).
- ClipSpec: JSON schema + `resolveClipSpec` (first match by declared order,
  ambiguous → `warning` + lexicographic `id`), the precedence merge
  (defaults < ClipSpec < user toggles), and application points
  (`forceDetector`/`suppressDetector` before precedence resolution;
  `articleRootSelector`/`dropSelectors` before general extraction). Each
  example ClipSpec has a fixture.

## Explicit deferrals / non-goals

- No Wikipedia or generic-site adapter (`decisions/0005`) — if a corpus
  fixture "needs" one, that is a stop-and-ask.
- No ClipSpec editor UI, no ClipSpec distribution/auto-update (non-goals).
- No authenticated-attachment or generated-image download (non-goal); only
  visible metadata.
- Markdown rendering of groups/conversations → Phase 7.
- Extension UI → Phase 9.

## Dependencies and assumptions

- Depends on Phase 3 (IR, ids, diagnostics), Phase 4 (pipeline, adapter seam,
  ClipSpec hook points), Phase 5 (code detectors run over message / tab
  subtrees).
- Assumes ChatGPT DOM fixtures are saved rendered snapshots of a fully loaded,
  non-streaming conversation with a known selected branch; provenance records
  they are synthetic or minimized (no account content committed without
  permission — `decisions/0020`, § 16).
- Assumes the Docusaurus tab DOM shape from pinned real-page snapshots.

## Design decisions already settled

`decisions/0013` (adapter interface, one site + one conversation adapter max,
run-order), `0008` (ChatGPT current-branch only), `0011` (`ConversationIR`,
`CodeGroupIR`, `AttachmentRef`), `0017` (streaming = fatal; attachments as
refs), `0018` (ClipSpec schema, precedence, versioning). New this phase: the
ChatGPT role/branch evidence rules (ADR), the Docusaurus grouping rules (ADR).

## Files to add/change

| Path                                                 | Purpose                                           |
| ---------------------------------------------------- | ------------------------------------------------- |
| `packages/adapters/src/docusaurus/tabs.ts`           | Docusaurus tab-group adapter                      |
| `packages/adapters/src/chatgpt/conversation.ts`      | ChatGPT current-branch adapter                    |
| `packages/adapters/src/chatgpt/roles.ts`             | role + branch evidence resolution                 |
| `packages/adapters/src/clipspec/schema.ts`           | ClipSpec JSON schema + validator                  |
| `packages/adapters/src/clipspec/resolve.ts`          | `resolveClipSpec` + precedence merge              |
| `packages/adapters/clipspecs/*.json`                 | 1–2 example ClipSpecs                             |
| `packages/adapters/src/index.ts`                     | export adapter set + resolver; drop scaffold stub |
| `packages/adapters/src/**/*.test.ts`                 | unit tests                                        |
| `fixtures/conversations/**`                          | ChatGPT fixtures (subset now; more in Phase 10)   |
| `fixtures/code/docusaurus-tabs/**`                   | tab-group fixtures                                |
| `tests/pipeline-adapters.test.ts`                    | integration over adapter fixtures                 |
| `decisions/00NN-chatgpt-branch-and-role-evidence.md` | branch/role rules                                 |
| `decisions/00NN-docusaurus-grouping.md`              | grouping rules                                    |
| `architecture/overview.md`                           | `adapters` row → real; step 5 → current           |
| `docs/capture-format.md`                             | conversation + code-group coverage                |
| `docs/privacy-and-security.md`                       | ChatGPT capture-scope note firmed                 |
| `CHANGELOG.md`                                       | Phase 6 entry                                     |

## Implementation sequence

1. ClipSpec schema + `resolveClipSpec` + precedence merge + unit tests;
   example ClipSpecs + fixtures proving each rule's effect.
2. Docusaurus adapter + ADR: grouping fixtures (2 tabs, 5 tabs, tab with
   non-code content, nested tabs) → `CodeGroupIR` with all members/labels.
3. ChatGPT `roles.ts` + ADR: role evidence per turn; branch determination;
   fatal paths (indeterminate branch, streaming).
4. ChatGPT `conversation.ts`: build `ConversationIR`; message blocks; code via
   Phase 5; tables/links/citations; attachment refs; per-message hash.
5. Wire adapters into the registry; assert exactly-one-site-adapter rule
   (two matching → fatal).
6. `tests/pipeline-adapters.test.ts`: `captureKind` = `conversation` for
   ChatGPT fixtures; role/order gate (`decisions/0020` gate 8); group
   retention gate (gate 7); determinism.
7. Update architecture + docs + changelog.
8. Direct review: `roles.ts` and `conversation.ts` against `decisions/0008`
   (nothing claimed beyond the visible selected branch).
9. `pnpm run ci`.
10. If authorized, commit `feat(phase-6): structured adapters`.

## Test fixtures and edge cases

- Docusaurus: 2-tab and 5-tab groups; a group where one tab is prose (noted,
  not forced into `members`); two independent groups on one page; a `<pre>`
  outside any group on the same page (stays a standalone block).
- ChatGPT: linear conversation (no branches); conversation with a branch
  switcher showing "2/3" (adapter captures branch 2 only, records evidence);
  conversation mid-stream (fatal); message with a table + fenced code + a
  citation link + an image attachment (metadata only); a `system`/`tool`-styled
  message; consecutive same-role messages (order preserved).
- ClipSpec: a spec forcing an article root; a spec suppressing `code/prism` on
  a URL glob; two specs matching the same URL (ambiguous → warning,
  lexicographic winner); an invalid spec (schema error, not applied).

## Runnable verification and expected outcomes

```sh
pnpm run ci
pnpm test -- tests/pipeline-adapters.test.ts
   # expect: ChatGPT fixtures -> correct roles + order for every message;
   #         Docusaurus fixtures -> every accessible alternative + label retained;
   #         streaming fixture -> exportStatus 'failed' with TC-ADAPT-BRANCH/stream;
   #         ClipSpec fixtures -> documented precedence outcome; determinism holds
```

## Documentation / ADR / changelog effects

- 2 new ADRs (ChatGPT branch/role evidence; Docusaurus grouping).
- `architecture/overview.md` step 5 + `adapters` row → current.
- `docs/capture-format.md` conversation/group sections;
  `docs/privacy-and-security.md` ChatGPT scope firmed.
- `CHANGELOG.md` Phase 6; `ROADMAP.md` Phase 6 → `done`; `CONTEXT.md` →
  Phase 7.

## Stop-and-ask conditions specific to this phase

- ChatGPT DOM cannot establish message completeness or roles from stable
  evidence for a case we meant to support (§ 16).
- A corpus fixture can only be handled by adding a generic-site or
  Wikipedia-specific adapter (`decisions/0005`).
- Capturing what the fixture shows would require reading a hidden/collapsed
  branch or reconstructing a deleted edit (`decisions/0008`).
- A ClipSpec rule would let AI-proposed content bypass the review/fixture path
  (`decisions/0002`).

## Completion evidence to record

- ChatGPT role/order gate results; group-retention gate results.
- `branchEvidence` contents for each conversation fixture.
- ClipSpec precedence test outcomes; the example ClipSpecs and their fixtures.
- Review notes confirming no over-claim beyond the visible branch.
- `pnpm run ci` output; commit hash once authorized.
