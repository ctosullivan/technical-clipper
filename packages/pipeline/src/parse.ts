/**
 * Fixture-time HTML parsing (`decisions/0022`). This is the **only** module
 * that imports `linkedom`; the browser extension imports `capture()` (which
 * takes an already-parsed `document`) and never pulls linkedom into its
 * bundle.
 */
import { parseHTML } from 'linkedom';
import { capture, type CaptureInput, type CaptureResult } from './capture.js';

/** Parse a rendered-HTML string into a DOM `Document` (no scripts run). */
export function parseDocument(html: string): Document {
  const looksLikeFullDoc = /<html[\s>]/i.test(html) || /<body[\s>]/i.test(html);
  const wrapped = looksLikeFullDoc
    ? html
    : `<!doctype html><html><head></head><body>${html}</body></html>`;
  const { document } = parseHTML(wrapped);
  return document as unknown as Document;
}

/** Convenience for fixtures/tests: parse `html` then {@link capture} it. */
export function captureFromHtml(
  html: string,
  input: Omit<CaptureInput, 'doc' | 'html'>,
): CaptureResult {
  return capture({ ...input, doc: parseDocument(html) });
}
