## User

How do I read a file in Python?

## Assistant

Use `open`:

```python
with open("f.txt") as fh:
    data = fh.read()

```

That reads the whole file.
