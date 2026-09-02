# 0016. Canonical serialization, normalization rulesets, hashing boundaries, and fence selection

## Status

Accepted (Phase 1 planning). Implemented in Phase 3; consumed by Phases 4–7.

## Context

`decisions/0006` set the reproducible-output policy but left the concrete rules
to Phase 1. § 10 requires canonical serialization/normalization policies,
raw-vs-normalized hashing boundaries, and safe Markdown fence selection for code
containing backticks or tildes. These must be one implementation in
`packages/core` that every renderer and the bundler consume.

## Decision

### Canonical JSON

- Encoding UTF-8, newline LF only.
- Object keys sorted ascending by Unicode code point.
- No insignificant whitespace in the **hashed** form (compact). The
  on-disk `document.json` / `manifest.json` / `diagnostics.json` are the
  pretty form (2-space indent, one trailing LF); the pretty form is a
  deterministic function of the compact form, so both are reproducible.
- Numbers: shortest round-tripping decimal (`JSON.stringify` of a normalized
  `number`); no `NaN`/`Infinity`; integers where the value is integral.
- Arrays keep semantic order (never sorted).
- Strings: no escaping beyond JSON minimum; `\uXXXX` only for control chars.
- `undefined`-valued fields are omitted; `null` is explicit and meaningful.

### Normalization rulesets (named, versioned)

Ruleset ids look like `norm/prose@1`. The id in force is recorded in
`SourceMetadata` and in the manifest.

**`norm/prose@1`** (applied to article/message prose text before id/hashing and
before Markdown rendering):

1. CRLF and lone CR → LF.
2. Unicode normalization to NFC.
3. Remove zero-width and bidi-control characters
   (`U+200B`–`U+200F`, `U+202A`–`U+202E`, `U+2060`, `U+FEFF` when not a
   leading BOM handled below).
4. Collapse runs of ASCII space/tab **between words** to a single space;
   preserve paragraph structure (that is carried by IR nodes, not whitespace).
5. Trim leading/trailing whitespace of each inline text run.

**`norm/code@1`** (applied to `CodeBlockIR.text` / terminal entry text):

1. If the string begins with a UTF-8 BOM (`U+FEFF`), strip exactly that one
   code point and record `bomStripped: true` in `Provenance.notes`.
2. Record — **do not change** — the dominant line-ending style and the
   final-newline state (`hasFinalNewline`).
3. **Nothing else.** No trimming, no tab/space conversion, no NFC, no
   whitespace collapse, no trailing-newline addition or removal.

A transformation of code text beyond rule 1 while the block is still labelled
`exact`/`normalized` is a stop-and-ask condition (`0012`).

**`norm/infostring@1`** (applied only to the Markdown fence info string, never
to code): lowercase; map through a checked-in alias table
(`ts`→`typescript`, `sh`/`shell`/`console`→ per terminal handling, etc.);
unknown token passes through unchanged and sets
`languageEvidence: 'inferred-heuristic'` only if it came from a heuristic, not
if it was page-declared.

### Hashing boundaries (all SHA-256, lowercase hex)

| hash                             | covers                                                                                                                                                                              |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CodeBlockIR.hash`               | the exact `text` bytes (UTF-8) after `norm/code@1`, i.e. post-BOM-strip, including or excluding the final newline exactly as present                                                |
| `MessageIR.hash`                 | canonical (compact) JSON of that `MessageIR` **excluding** its own `hash` field                                                                                                     |
| `hashes.documentContentIdentity` | canonical compact JSON of the whole `DocumentIR` with `source.captureTimestamp` and `source.pageLoadState.observedAt` removed and each `MessageIR.hash`/`CodeBlockIR.hash` retained |
| `hashes.markdown`                | exact bytes of the rendered `content.md` (per profile)                                                                                                                              |
| `hashes.rawPageHtml`             | exact bytes of `raw/page.html` when included                                                                                                                                        |

The manifest lists every hash with its `evidenceSource` and the ruleset ids in
force.

### Safe Markdown fence selection (per `CodeBlockIR`)

1. Find `B` = longest run of consecutive backticks anywhere in `text`; `T` =
   longest run of tildes.
2. Default fence char = backtick. Switch to tilde only if `B > 0` **and**
   `T == 0` **and** the info string contains no tilde.
3. Fence length = (longest run of the chosen char in `text`) + 1, minimum 3.
4. Never backslash-escape, entity-encode, or otherwise alter bytes inside the
   fence. If for any reason exact bytes cannot be represented within a fenced
   block (should be impossible given steps 1–3), emit `fatal`
   `TC-RENDER-FENCE` rather than emit altered code.
5. Info string = `norm/infostring@1(language)` plus, in the `obsidian`/`gfm`
   profile only, optional `{N,M-K}` highlight-line suffix when
   `highlightedLines` is set and the profile documents it.

### Render-back verification

After rendering, the renderer re-parses each fenced block it emitted and
asserts the extracted content equals the source `CodeBlockIR.text` byte for
byte. Mismatch ⇒ `fatal` `TC-RENDER-CODE-MISMATCH` (`0015`).

## Alternatives considered

- **JCS (RFC 8785) verbatim** — adopted in spirit; we pin our own small spec
  to avoid a dependency and to control the pretty-vs-compact split.
- **Hash the pretty JSON** — rejected: any indent/formatter change would break
  hashes; hashing the compact form decouples identity from presentation.
- **One normalization ruleset for prose and code** — rejected explicitly by
  the anti-pattern catalogue (§ 9) and § 16 stop-and-ask.
- **Always use tildes for code that contains backticks** — rejected: backtick
  fences are far more portable; only switch when forced.

## Consequences

- `packages/core` owns `canonicalize()`, the ruleset registry,
  `computeHash()`, and `selectFence()`; nothing reimplements them.
- Fixtures store the compact-JSON hash inputs implicitly via `expected-ir.json`
  plus an `expected-hashes.json` per case.
- Changing any ruleset is a ruleset **version bump** + ADR + regenerated
  fixtures, never an in-place edit.
