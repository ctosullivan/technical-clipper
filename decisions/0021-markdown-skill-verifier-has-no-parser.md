# 0021. The markdown-clipping skill verifier uses no Markdown parser

## Status

Accepted (Phase 2).

## Context

`planning/v0-to-mvp-planning-prompt.md` § 9 requires
`.claude/skills/markdown-clipping/scripts/verify-examples.mjs` to run
deterministic, offline checks of the skill's normative examples and
anti-examples, and says it "may use a pinned Markdown parser if the phase plan
and ADR explain why, but it must not treat a single parser's behaviour as the
specification."

## Decision

`verify-examples.mjs` uses **no Markdown parser** — not even a pinned one. It
checks only byte-level and lexical invariants:

- the fence-selection algorithm (`decisions/0016`) against a table of
  code inputs → expected fence char/length, plus a round-trip check that
  extracting the fenced content returns the exact input bytes;
- code-span backtick-run sizing and space padding;
- table-cell pipe escaping;
- YAML property-value quoting (the ambiguous-value predicate and the
  serializer);
- anti-pattern **detectors** run over rendered-output strings (encoded escapes
  inside a fence, Obsidian-only syntax leaking into a lower profile, a
  source link rendered as a wikilink);
- structural assertions on the reference files themselves (present, non-empty,
  ≥ 17 catalogued anti-patterns).

CommonMark / GFM conformance examples are cited **inline in the reference
notes** as attributed input/output pairs; the verifier asserts our own fence
and escape rules are consistent with the ones that concern code fences and
code spans, rather than parsing them.

Full parser-based Markdown conformance lives in **Phase 7**, where the real
IR→Markdown renderer is checked against golden `expected.md` fixtures and a
selected CommonMark example subset — there, correctness is judged against the
spec's expected HTML, and any parser used is a test oracle, not "the spec".

## Alternatives considered

- **Pin `commonmark` / `markdown-it` and run the full spec suite here** —
  rejected for Phase 2: it would (a) add a runtime dependency to a
  development-only skill, (b) tempt readers to treat that parser's output as
  authoritative, and (c) duplicate what Phase 7 must do properly against the
  renderer. The skill's job is to state the rules; the renderer's job is to
  pass conformance.
- **Ship the full `spec.json` conformance corpus in the repo** — rejected:
  § 9 says "Do not copy an entire external specification into the repository";
  a selected subset with attribution is the sanctioned approach.
- **No verifier, prose only** — rejected: § 9 mandates deterministic offline
  checks and the anti-example catalogue must be executable.

## Consequences

- The verifier is a single dependency-free `.mjs` file; `pnpm run skill:verify`
  and CI run it with plain `node`.
- `verify-examples.mjs` exports its rule implementations (`selectFence`,
  `renderCodeSpan`, `escapeTableCell`, `yamlScalar`, the detectors). Phase 3's
  `packages/core/src/fence.ts` must produce identical results for the shared
  cases — a Phase 3 test imports the fixture table to lock this.
- If a reference note changes, its SHA-256 in
  `references/source-register.md` must be refreshed (the verifier checks
  presence, a human refreshes the hash — a future enhancement may assert it).
