# Release notes 4.2

This release focuses on determinism and error reporting. It contains no breaking changes to the capture bundle format.

## Added

- A completeness report is now written into every bundle.
- The export gate blocks on `failed` and warns on `partial`.

## Fixed

- Inter-word spacing was lost when a bold run met a plain run.
- Duplicate `References` headings on some articles.

## Known issues

Virtualized editors are still reported as `partial`; exact recovery is out of scope for this line.
