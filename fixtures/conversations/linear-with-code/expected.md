---
title: Example chat
source_url: https://chatgpt.com/c/linear-example
canonical_url: https://chatgpt.com/c/linear-example
captured: "2026-01-01T00:00:00.000Z"
extractor_version: chatgpt/current-branch@1.0.0
export_status: complete
capture_kind: conversation
---

## User

How do I read a file in Python?

## Assistant

Use `open`:

```python
with open("f.txt") as fh:
    data = fh.read()

```

That reads the whole file.
