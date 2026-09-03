# `fetchJSON(url, options)`

Fetches [the resource](https://docs.example/api/fetch-json) at `url` and parses the response body as JSON. Rejects on a non-2xx status or a body that is not valid JSON.

## Parameters

- **Name:** `url` · **Type:** string · **Default:** — · **Description:** Absolute or relative URL. Relative URLs resolve against `document.baseURI`.
- **Name:** `options.timeoutMs` · **Type:** number · **Default:** `10000` · **Description:** Abort the request after this many milliseconds.
- **Name:** `options.retries` · **Type:** number · **Default:** `0` · **Description:** Retry count for network errors only, not HTTP errors.

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
