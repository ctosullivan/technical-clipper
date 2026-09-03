---
title: Environment variables
source_url: https://example.com/docs/config/env
canonical_url: https://example.com/docs/config/env
captured: "2026-01-01T00:00:00.000Z"
extractor_version: 1.0.0
export_status: complete
capture_kind: technical_article
---

# Environment variables

Every configuration key can be set with an environment variable. The variable name is the key path in upper snake case, prefixed with `APP_`.

## Naming

The key `server.port` becomes `APP_SERVER_PORT`. Nested keys join with a single underscore.

## Types

- Numbers and booleans are parsed; everything else stays a string.
- An empty value unsets the key rather than setting it to `""`.

```shell
APP_SERVER_PORT=8080 APP_LOG_JSON=true ./app

```
