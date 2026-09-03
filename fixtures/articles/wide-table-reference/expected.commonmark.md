# HTTP status codes at a glance

A compact reference for the status codes this service can return, with the retry behaviour clients should apply to each.

## Client and server codes

- **Code:** 400 · **Name:** Bad Request · **Category:** Client · **Body?:** yes · **Retry:** no · **Idempotent-safe:** n/a · **Typical cause:** Malformed payload or query
- **Code:** 401 · **Name:** Unauthorized · **Category:** Client · **Body?:** yes · **Retry:** after refresh · **Idempotent-safe:** yes · **Typical cause:** Missing or expired token
- **Code:** 404 · **Name:** Not Found · **Category:** Client · **Body?:** yes · **Retry:** no · **Idempotent-safe:** yes · **Typical cause:** Unknown resource id
- **Code:** 409 · **Name:** Conflict · **Category:** Client · **Body?:** yes · **Retry:** no · **Idempotent-safe:** no · **Typical cause:** Concurrent write
- **Code:** 429 · **Name:** Too Many Requests · **Category:** Client · **Body?:** yes · **Retry:** yes, honour `Retry-After` · **Idempotent-safe:** yes · **Typical cause:** Rate limit
- **Code:** 500 · **Name:** Internal Server Error · **Category:** Server · **Body?:** maybe · **Retry:** yes, backoff · **Idempotent-safe:** yes · **Typical cause:** Unhandled exception
- **Code:** 503 · **Name:** Service Unavailable · **Category:** Server · **Body?:** maybe · **Retry:** yes, backoff · **Idempotent-safe:** yes · **Typical cause:** Deploy or overload

## Notes

- Only retry non-idempotent requests when the response explicitly permits it.
- All backoff is full-jitter exponential with a 30-second ceiling.
