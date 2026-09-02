# Capture bundle format

**Status: not yet implemented.** This document is a Phase 0 stub. The full
capture bundle contract (file layout, canonical JSON encoding, hashing
boundaries, ZIP determinism policy) is designed in Phase 1 planning and
implemented in Phase 7 — see `planning/ROADMAP.md`.

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
