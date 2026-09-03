# 0033. Obsidian handoff: the `obsidian://new` URI with a content-size guard

## Status

Accepted (Phase 9).

## Context

`planning/v0-to-mvp-planning-prompt.md` § 3 requires "hand the note to Obsidian
using an explicitly documented mechanism"; § 16 makes it a stop-and-ask if
"the selected Obsidian handoff cannot reliably handle the planned content
size."

## Decision

The default mechanism is the **`obsidian://new` URI scheme**
(`planObsidianHandoff` in `packages/extension/src/obsidian.ts`):

```
obsidian://new?name=<note name>&vault=<vault?>&content=<url-encoded markdown>
```

- `name` = the capture title, stripped of vault-illegal characters
  (`\ / : * ? " < > | # ^ [ ]`), collapsed whitespace, ≤ 100 chars.
- `vault` is set only when the user configured a target vault.
- `content` = the rendered `obsidian`-profile Markdown.

### Size guard + fallback

If the UTF-8 size of the Markdown exceeds **`OBSIDIAN_URI_LIMIT` (200 KB)**,
the handoff returns `method: 'fallback'` with a user-facing `reason`, and the
results page shows: _"This note is N KB, larger than the 200 KB the Obsidian
URI can carry reliably. Copy the Markdown or download the bundle instead."_
Copy and Download remain available.

200 KB is deliberately conservative: Chromium's address bar accepts ~2 MB, but
`navigator` URL handling, the OS `open` call, and Obsidian's own parsing are
all stricter, and URL-encoding inflates the payload. A capture larger than
this is rare and the fallback is lossless (the bundle has everything).

## Alternatives considered

- **Write the file to disk via the File System Access API** — rejected: needs
  a user gesture + directory permission per session, and doesn't target a
  vault; the URI scheme is Obsidian's own supported entry point.
- **A companion Obsidian plugin** — explicit non-goal (§ 5).
- **No size limit** — rejected by § 16: a silently-truncated or failed
  `obsidian://` navigation is worse than an explicit fallback.
- **Base64 the content** — rejected: larger payload, and `obsidian://new`
  expects plain `content`.

## Consequences

- `docs/cli-or-extension-reference.md` documents the URI scheme and the
  fallback.
- The 200 KB limit is a single exported constant; raising it needs evidence
  (a real vault + large notes) and an ADR.
- If a future test shows the URI failing well below 200 KB on some platform,
  that is the § 16 stop-and-ask — lower the limit, don't paper over it.
