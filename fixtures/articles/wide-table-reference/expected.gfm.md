# HTTP status codes at a glance

A compact reference for the status codes this service can return, with the retry behaviour clients should apply to each.

## Client and server codes

| Code | Name | Category | Body? | Retry | Idempotent-safe | Typical cause |
| --- | --- | --- | --- | --- | --- | --- |
| 400 | Bad Request | Client | yes | no | n/a | Malformed payload or query |
| 401 | Unauthorized | Client | yes | after refresh | yes | Missing or expired token |
| 404 | Not Found | Client | yes | no | yes | Unknown resource id |
| 409 | Conflict | Client | yes | no | no | Concurrent write |
| 429 | Too Many Requests | Client | yes | yes, honour `Retry-After` | yes | Rate limit |
| 500 | Internal Server Error | Server | maybe | yes, backoff | yes | Unhandled exception |
| 503 | Service Unavailable | Server | maybe | yes, backoff | yes | Deploy or overload |

## Notes

- Only retry non-idempotent requests when the response explicitly permits it.
- All backoff is full-jitter exponential with a 30-second ceiling.
