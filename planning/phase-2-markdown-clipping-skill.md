# Phase 2 — Markdown-clipping Claude skill

## Status

done

## Completion evidence

- **Sources retrieved 2026-09-03** (recorded in `references/source-register.md`
  with URLs, versions, licences, sections, and SHA-256 of each derived note):
  CommonMark **0.31.2 (2024-01-28)**, GFM **0.29-gfm (2019-04-06)**, Obsidian
  Help pages `syntax` / `advanced-syntax` / `properties` / `links` / `embeds` /
  `callouts` (no version string exposed; `help.obsidian.md` → `obsidian.md/help`
  301), Claude Code skills docs (`docs.anthropic.com` → `code.claude.com` 301).
- **Files:** `.claude/skills/markdown-clipping/SKILL.md`,
  `references/{commonmark,gfm,obsidian-markdown,clipping-antipatterns,source-register}.md`,
  `scripts/verify-examples.mjs`, `discovery-check.md`; `decisions/0021`;
  `package.json` (`skill:verify`, added to `ci`); `.github/workflows/ci.yml`
  (branch fix + verify step); `eslint.config.js` (mjs globals); `CLAUDE.md`,
  `README.md`, `architecture/overview.md`, `CHANGELOG.md`.
- **`pnpm run skill:verify`** — PASS, 0 failures (fence selection, code-span
  sizing, table pipe escaping, YAML quoting, anti-pattern detectors, reference
  files present, source-register versions + real hashes, SKILL.md discovery
  description + under 500 lines).
- **`pnpm run ci`** — green (`format:check`, `lint`, `tsc -b`, 9 tests,
  `skill:verify`).
- **Profile-correctness review:** every rule in the three profile references
  sits under the correct profile heading; Obsidian-only constructs (`==`,
  `[[ ]]`, callouts, `%%`, properties, block refs) are all in
  `obsidian-markdown.md` and the anti-pattern catalogue explicitly forbids
  them in `commonmark`/`gfm`.
- **Discovery check:** `discovery-check.md` should/should-not table reviewed;
  the verifier asserts the description mentions Markdown, Obsidian, CommonMark,
  GFM, fixture, profile and stays under the 1,536-char listing cap.
- **Commit:** `b6…` — see `planning/CONTEXT.md`.

The scope note in the plan below is the original Phase 1 statement, retained
for context.

## Goal and user-visible outcome

A project skill at `.claude/skills/markdown-clipping/` that gives Claude (and
compatible agents) correct, current, profile-separated CommonMark / GFM /
Obsidian Markdown guidance whenever they design, implement, test, or review
Markdown rendering, capture fixtures, Obsidian export, or clipping fidelity.
No user-visible product change and no runtime dependency — the extension never
loads this skill (`decisions/0002`, `CLAUDE.md`).

## Scope covered

- `SKILL.md` with valid current Claude Code skill frontmatter (focused `name`,
  a `description` that triggers on the tasks above) and concise routing to
  reference files.
- `references/source-register.md` — retrieval date, exposed spec version /
  page revision, canonical URL, relevant sections, and a SHA-256 of every
  locally retained derived note.
- `references/commonmark.md`, `references/gfm.md`,
  `references/obsidian-markdown.md` — concise, attributed, derived notes (not
  copied specs) covering the § 9 checklist (block vs inline, blank-line
  semantics, breaks, nested lists, blockquotes, headings, links, images,
  entities, raw HTML, tables, footnotes, task lists; code spans/fences with
  backticks and tildes; the longer-outer-fence rule and `0016` fence
  algorithm; info-string normalization without touching code; YAML property
  rules; wikilinks vs links, block refs, embeds, callouts, comments,
  highlights; pipe/delimiter escaping; exact-code-bytes vs container syntax;
  prose-vs-code whitespace policy).
- `references/clipping-antipatterns.md` — every failure in the § 9 catalogue,
  each with a wrong example, a right example, and why.
- `scripts/verify-examples.mjs` — deterministic offline checks of the skill's
  normative examples and anti-examples; runs official CommonMark spec examples
  / a small selected conformance subset plus Obsidian-targeted golden fixtures.
- A discovery-description test: representative prompts that must and must not
  trigger the skill, recorded and checked.
- ADR for the pinned Markdown parser used by `verify-examples.mjs` (if any) and
  why a single parser is not treated as the spec.

## Explicit deferrals / non-goals

- No IR types, no renderer — those are Phases 3 and 7. The skill describes what
  the renderer must do; it does not implement it.
- No shipping the skill in the extension bundle; no automatic side effects; no
  broad tool grants in frontmatter.
- No copying whole external specifications into the repo.
- Not the authority to change capture/extraction behaviour (`decisions/0002`).

## Dependencies and assumptions

- Depends on Phase 1 only (this plan set + `0019` profile contract).
- Assumes network access **at authoring time** to the official sources in
  § 9 (CommonMark, GFM, Obsidian help pages, Claude Code skills docs).
  Retrieval metadata is recorded; the resulting skill is fully offline.
- Assumes the current Claude Code skill frontmatter schema at authoring time;
  `source-register.md` records the skills-doc revision consulted.

## Design decisions already settled

- Three explicit profiles, capability matrix, and "never imply portability"
  rule: `decisions/0019`.
- Fence-selection algorithm and info-string normalization: `decisions/0016`.
- Prose-vs-code whitespace separation: `decisions/0016` (`norm/prose@1` vs
  `norm/code@1`).
- Skill is development-time only: `decisions/0002`, `CLAUDE.md`.

## Files to add/change

| Path                                                                   | Purpose                                                      |
| ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| `.claude/skills/markdown-clipping/SKILL.md`                            | Skill entry: frontmatter + concise routing                   |
| `.claude/skills/markdown-clipping/references/source-register.md`       | Source provenance + hashes of derived notes                  |
| `.claude/skills/markdown-clipping/references/commonmark.md`            | Derived CommonMark notes                                     |
| `.claude/skills/markdown-clipping/references/gfm.md`                   | Derived GFM-extension notes                                  |
| `.claude/skills/markdown-clipping/references/obsidian-markdown.md`     | Derived Obsidian-additions notes                             |
| `.claude/skills/markdown-clipping/references/clipping-antipatterns.md` | § 9 anti-pattern catalogue with tested examples              |
| `.claude/skills/markdown-clipping/scripts/verify-examples.mjs`         | Offline example/anti-example verifier                        |
| `.claude/skills/markdown-clipping/fixtures/`                           | Golden inputs/outputs for the verifier                       |
| `decisions/0021-markdown-verifier-parser-choice.md`                    | ADR: pinned parser choice + "not the spec" caveat            |
| `package.json`                                                         | Add `skill:verify` script running the verifier               |
| `.github/workflows/ci.yml`                                             | Run `skill:verify` in CI                                     |
| `CLAUDE.md`                                                            | Update the skill note from "created in Phase 2" to "present" |
| `README.md`                                                            | Repository map row already exists; flip its status note      |
| `CHANGELOG.md`                                                         | `[Unreleased]` Phase 2 entry                                 |
| `architecture/overview.md`                                             | Note the skill exists and is non-runtime                     |

## Implementation sequence

1. Retrieve each § 9 source, following official redirects; capture URL,
   date, exposed version/revision, relevant section list. Write
   `source-register.md` as you go.
2. Draft the three profile references from the retrieved material — derived
   notes only, attributed, with minimal conformance examples where ambiguity
   exists.
3. Draft `clipping-antipatterns.md` covering every § 9 item.
4. Write `verify-examples.mjs` + golden fixtures: official CommonMark example
   subset, GFM extension cases, Obsidian golden cases, and one failing case
   per anti-pattern. Deterministic, offline, exits non-zero on any mismatch.
5. Write `SKILL.md`: frontmatter (focused name; description enumerating the
   trigger tasks), a short overview, and routing to the references. No broad
   tools.
6. Write the discovery-description test: a table of prompts →
   expected-triggered (yes/no), checked by a small script or documented
   manual procedure.
7. Add `decisions/0021`.
8. Wire `package.json` `skill:verify` and CI.
9. Update `CLAUDE.md`, `README.md`, `architecture/overview.md`, `CHANGELOG.md`.
10. Direct review: read every reference note and confirm each claim is under
    the correct profile heading (no Obsidian-only syntax presented as
    CommonMark/GFM).
11. Run `pnpm run ci` + `pnpm run skill:verify`.
12. If authorized, commit `docs(phase-2): add markdown-clipping skill`.

## Test fixtures and edge cases

- Code span containing a run of backticks; fenced code containing a longer
  backtick run and a tilde run (exercises `0016` step 1–3).
- Info string with an alias (`ts`, `sh`) — normalized in the info string,
  code untouched.
- YAML property values: a wikilink, a timestamp, a boolean-looking string, a
  value with a leading `@` or `:` — all must be quoted/typed correctly.
- Table cell containing a pipe and a table cell containing a soft line break.
- Nested list → blockquote → callout, each requiring its prefix preserved.
- Anti-example per § 9 bullet (triple-backtick-everything, escaping inside
  fences, block code as inline, chrome copied into source, dropped final
  newline, flattened tab alternatives, unsanitized HTML into preview,
  Obsidian syntax in CommonMark, malformed properties, unquoted YAML,
  source-link vs wikilink confusion, malformed pipe tables, dropped list
  prefixes, inferred semantics unrecorded, same whitespace rules for
  prose+code, "preview proves fidelity", silent node drop).

## Runnable verification and expected outcomes

```sh
pnpm run ci            # unchanged: still green
pnpm run skill:verify  # expect: all CommonMark subset + GFM + Obsidian golden
                       #         checks pass; every anti-example is flagged;
                       #         exit 0
```

Plus the manual review checklist (profile-correctness of every claim) and the
discovery-prompt check.

## Documentation / ADR / changelog effects

- `decisions/0021` added.
- `CLAUDE.md`, `README.md`, `architecture/overview.md` updated to reflect the
  skill's existence and non-runtime status.
- `CHANGELOG.md` `[Unreleased]`: "Phase 2: markdown-clipping development skill
  (CommonMark/GFM/Obsidian references, anti-pattern catalogue, offline
  verifier)."
- `ROADMAP.md` Phase 2 → `done`; `CONTEXT.md` → Phase 3 next.

## Stop-and-ask conditions specific to this phase

- An official source has moved / changed structure such that a § 9 requirement
  can't be sourced primarily (no reliable primary doc) — report, don't fill
  from memory.
- A source's licence disallows retaining even a short derived note — record and
  ask.
- The current Claude Code skill frontmatter schema differs materially from what
  the phase assumes (e.g. `description` semantics changed) — confirm before
  finalizing.
- The verifier would need a network call or a live parser service — stop; it
  must be offline.

## Completion evidence to record

- `source-register.md` contents (dates, versions, hashes).
- `pnpm run skill:verify` output.
- The discovery-prompt check result.
- The profile-correctness review notes.
- `pnpm run ci` output (no product regression).
- Commit hash once authorized.
