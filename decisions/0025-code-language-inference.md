# 0025. Code language inference and confidence

## Status

Accepted (Phase 5).

## Context

`planning/v0-to-mvp-planning-prompt.md` § 4 requires capturing "code language
and the evidence used to infer it". `decisions/0011` defines
`CodeBlockIR.language` + `languageEvidence`
(`info-string` | `class-token` | `adapter` | `inferred-heuristic` | `none`).
Phase 5 must decide how a detector fills these and when a guess is
low-confidence enough to warrant `TC-EXTRACT-LANG-LOWCONF`.

## Decision

`inferLanguage(codeEl, containerEl, text, infoString?)` in
`packages/detectors/src/language.ts` resolves in this order:

1. **`infoString`** (adapter-supplied) → `normalizeInfoString` →
   `evidence: 'info-string'`, high confidence.
2. **Declared class / data token** on the `<code>` or its `<pre>`:
   `language-x` / `lang-x` / `brush: x` / `highlight-source-x` class, or
   `data-lang` / `data-language` / `data-code-language`. Ignored tokens:
   `none`, `plain`, `text`. → `normalizeInfoString` →
   `evidence: 'class-token'`, high confidence.
3. **Heuristic** — a small ordered table of **strong, unambiguous** regexes
   (HTML tags, JSON delimiters, `def`/`class`/`import` for Python, shell
   command prefixes, TS type annotations, JS keywords, CSS rule blocks, SQL
   verbs, Rust/Go idioms). First match wins → `evidence: 'inferred-heuristic'`,
   **low confidence** → the detector emits `TC-EXTRACT-LANG-LOWCONF` (warning).
4. **No signal** → `language: null`, `evidence: 'none'`, no diagnostic.

The heuristic never runs when a declared token exists, and never overrides it.
The heuristic set is deliberately small — it is better to return `null` than
to guess wrong with apparent confidence (`decisions/0012` spirit).

A heuristic language guess demotes a capture to `complete_with_warnings`
(`decisions/0015`); this is intentional — the language is genuinely uncertain
and the reader should know. The **code bytes** are unaffected by language
inference and their `confidence` is independent.

## Alternatives considered

- **A real language classifier (e.g. linguist / highlight.js auto-detect)** —
  rejected: adds a dependency, is itself probabilistic, and would still need a
  confidence story. The IR's `languageEvidence` already records uncertainty.
- **Never guess (only declared tokens)** — rejected: many real code blocks
  carry no class and a conservative single-signal heuristic (`def `, `<html`,
  `SELECT `) is high-value and low-risk when clearly marked low-confidence.
- **Guess silently with no warning** — rejected: contradicts § 1
  ("uncertainty … is reported before export").

## Consequences

- The heuristic table lives in one exported constant; adding a rule is an ADR
  note + regenerated code fixtures.
- Code fixtures without a language class land at `complete_with_warnings` when
  the heuristic fires — this is captured in their goldens.
- Phase 7's Markdown renderer normalizes the language token again for the
  fence info string (`norm/infostring@1`) but never touches the code.
