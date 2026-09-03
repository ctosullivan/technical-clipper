---
title: fetchJSON(url, options)
source_url: https://docs.example/api/fetch-json
canonical_url: https://docs.example/api/fetch-json
author: Docs Team
captured: "2026-01-01T00:00:00.000Z"
extractor_version: 1.0.0
export_status: complete
capture_kind: technical_article
---

# `fetchJSON(url, options)`

Fetches [the resource](https://docs.example/api/fetch-json) at `url` and parses the response body as JSON. Rejects on a non-2xx status or a body that is not valid JSON.

## Parameters

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `url` | string | — | Absolute or relative URL. Relative URLs resolve against `document.baseURI`. |
| `options.timeoutMs` | number | `10000` | Abort the request after this many milliseconds. |
| `options.retries` | number | `0` | Retry count for network errors only, not HTTP errors. |

## Return value

A `Promise` that resolves with the parsed value.

## Example

```javascript
const user = await fetchJSON('/api/users/42', { timeoutMs: 2000 });
console.log(user.name);

```

## Errors

- **HttpError** — the response status was outside 200–299.

  - `error.status` holds the numeric code.

- **TimeoutError** — the request exceeded `timeoutMs`.

## See also

- [`postJSON()`](https://docs.example/api/post-json)
