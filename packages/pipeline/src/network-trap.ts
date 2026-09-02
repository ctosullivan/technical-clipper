/**
 * Capture-time network trap — `decisions/0001`, `0009`;
 * `planning/v0-to-mvp-planning-prompt.md` § 12 gate 12.
 *
 * Capture must not make network requests. This installs throwing stubs over
 * the network primitives for the duration of a function call, so any attempt
 * fails loudly (and a test asserting "no network during capture" is real).
 */

const NET_GLOBALS = [
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'EventSource',
  'importScripts',
] as const;

export class CaptureNetworkError extends Error {
  constructor(what: string) {
    super(`Network access during capture is forbidden: ${what}`);
    this.name = 'CaptureNetworkError';
  }
}

/** Run `fn` with network primitives replaced by throwing stubs. */
export function runWithNetworkTrap<T>(fn: () => T): T {
  const g = globalThis as Record<string, unknown>;
  const saved = new Map<string, unknown>();

  for (const key of NET_GLOBALS) {
    saved.set(key, g[key]);
    g[key] = () => {
      throw new CaptureNetworkError(key);
    };
  }
  const nav =
    (g.navigator as { sendBeacon?: unknown } | undefined) ?? undefined;
  const savedBeacon = nav?.sendBeacon;
  if (nav) {
    nav.sendBeacon = () => {
      throw new CaptureNetworkError('navigator.sendBeacon');
    };
  }

  try {
    return fn();
  } finally {
    for (const [key, value] of saved) {
      if (value === undefined) delete g[key];
      else g[key] = value;
    }
    if (nav) {
      if (savedBeacon === undefined) delete nav.sendBeacon;
      else nav.sendBeacon = savedBeacon;
    }
  }
}
