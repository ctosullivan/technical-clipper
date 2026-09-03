# Configuration options

Each subsystem below has its own _Options_ and _Examples_ section. Jump straight to [logging options](https://docs.example/config/options#logging-options) or [cache options](https://docs.example/config/options#cache-options).

## Logging

### Options

- `level` — one of `debug`, `info`, `warn`, `error`.
- `json` — emit one JSON object per line when `true`.

### Examples

See the [cache examples](https://docs.example/config/options#cache-examples) for the matching pattern.

```toml
[logging]
level = "info"
json = true

```

## Cache

### Options

- `maxEntries` — evict least-recently-used past this count.
- `ttlSeconds` — hard expiry regardless of use.

### Examples

```toml
[cache]
maxEntries = 5000
ttlSeconds = 300

```

Back to [logging](https://docs.example/config/options#logging).
