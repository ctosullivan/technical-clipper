# 0014. Stable, content-addressable node identifiers

## Status

Accepted (Phase 1 planning). Implemented in Phase 3.

## Context

§ 10 requires "stable block/message identifiers that do not rely on generated
CSS classes." Fixtures compare IR by id; diagnostics reference nodes by id;
the capture bundle may use content-addressable block identities (§ 11). Ids
must be deterministic for identical normalized input and independent of
Prism/Highlight.js/Docusaurus/ChatGPT-generated attributes.

## Decision

### Algorithm

For every block node, inline node that needs referencing (links, footnote
defs, references), and message:

```
id = base32lower( sha256( canonicalSeed ) ).slice(0, 16)
```

`canonicalSeed` is the canonical-JSON (`0016`) encoding of an ordered tuple:

- **Prose block** (`heading`, `paragraph`, `blockquote`, `list`, …):
  `[ type, parentId, ordinalAmongSameTypeSiblings, normalizedText ]`
  where `normalizedText` is the concatenated normalized text of the node's
  inline descendants (ruleset `norm/prose`).
- **Code leaf** (`CodeBlockIR`): `[ 'codeBlock', exactBytesUtf8, hasFinalNewline ]`
  — content-addressed on the exact code, so the same snippet anywhere yields
  the same id.
- **Code group / terminal**: `[ type, ...memberOrEntryIds ]`.
- **Message** (`MessageIR`): `[ 'message', role, order, firstBlockIds.join() ]`.
- **Reference / footnote definition**: `[ type, label, normalizedText ]`.

### Collision handling

If two sibling nodes produce the same id (genuinely identical content in the
same parent at the same ordinal — only possible via a seed-construction bug),
append `-{globalDocumentOrderIndex}` and emit an `info` diagnostic. The
validator asserts global id uniqueness after assembly.

### What is deliberately excluded from the seed

DOM `id`/`class`/`data-*` attributes, element tag names beyond the IR `type`,
source line numbers, capture timestamp, and any adapter/detector version. Ids
are a function of _captured meaning_, not of the page's markup or the tools
used.

## Alternatives considered

- **Sequential counters (`block-1`, `block-2`)** — rejected: not stable under
  insertion; a fixture edit renumbers everything downstream, making review
  diffs unreadable.
- **XPath / DOM structural path as id** — rejected: depends on markup that
  adapters and the general extractor intentionally change.
- **Random UUIDs** — rejected: breaks determinism and reproducible-output
  gates (`0006`).
- **Full-length hashes** — rejected: 16 base32 chars (80 bits) is ample for a
  single document; keeps fixtures and Markdown anchors readable.

## Consequences

- `packages/core` exports `computeNodeId(seed)` and the per-node seed builders;
  detectors/adapters call them rather than inventing ids.
- Because code ids are content hashes, `document.json` can expose a
  `blockIndex` map for content-addressable lookup (§ 11) with no extra work.
- Reordering a paragraph changes only that paragraph's `ordinal`-derived id and
  its children's `parentId`-derived ids — localized, reviewable diffs.
- Markdown heading anchors (Obsidian block refs) can be derived from these ids
  deterministically.
