# Capture bundle format

**Status: partially implemented.** The bundle packaging (file layout, ZIP
determinism) is designed in `decisions/0017` and implemented in Phase 7. The
IR contract that `document.json` serializes — `DocumentIR` and its node tree,
per `decisions/0011` — is implemented in `packages/core` as of Phase 3, along
with the canonical JSON encoding (`decisions/0016`: compact form is hashed,
pretty form with LF newlines + one trailing LF is written to disk),
the normalization rulesets (`norm/prose@1`, `norm/code@1`,
`norm/infostring@1`), the SHA-256 hashing boundaries, and content-addressable
node ids (`decisions/0014`). `content.md` / `manifest.json` / `diagnostics.json`
and the ZIP still land in Phase 7.

As of Phase 4, `packages/pipeline` populates a `DocumentIR` from a rendered
article DOM (`decisions/0022`–`0024`): deterministic article-root selection,
structural-noise removal recorded as `removedRegions`, DOM → block/inline
nodes, protected-code restoration at sentinels, and the
`documentContentIdentity` plus per-code-block hashes. The Markdown and bundle
files are still Phase 7.

## Planned minimum bundle shape

```text
capture-name/
├── content.md
├── document.json
├── manifest.json
├── diagnostics.json
└── raw/
    └── page.html
```

Open questions this document will answer once Phase 7 lands (tracked in
`planning/v0-to-mvp-planning-prompt.md` § 11 and settled by ADRs referenced
from here):

- whether raw HTML is always included or user-selectable;
- sanitization/privacy handling, especially for ChatGPT captures;
- canonical JSON encoding and newline rules;
- stable ZIP entry ordering, timestamps, and permissions;
- exactly which bytes each SHA-256 hash covers;
- format/adapter version fields and forward-compatibility policy;
- whether two captures of identical content at different times are expected
  to produce identical whole-bundle bytes or only identical content hashes.

Do not treat any of the above as decided until this stub is replaced by the
Phase 7 implementation and the corresponding ADR(s) are linked here.
