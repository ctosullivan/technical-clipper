# Routing guide

This guide explains how the router maps a URL to a view. If you are new, read the [getting-started guide](https://docs.example/docs/getting-started) first.

**Note:** route matching is case-sensitive except for the scheme and host.

## Defining routes

A route is an object with a `path` and a `component`:

```typescript
export const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
];

```

Paths are matched in declaration order; the first match wins.

## Nested routes

Child routes render into a parent's `<Outlet />`. The steps are:

1. Add a `children` array to the parent route.

   1. Give each child a _relative_ path (no leading slash).
   2. Render `<Outlet />` where the child should appear.

2. Link to the child with its full, absolute path.

## See also

- [Data loading](https://docs.example/docs/data-loading)
- [Redirects](https://docs.example/docs/redirects)
