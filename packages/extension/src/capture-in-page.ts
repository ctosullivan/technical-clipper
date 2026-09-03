/**
 * Content script injected into the active tab by
 * `chrome.scripting.executeScript({ files: ['capture-in-page.js'] })`.
 *
 * It runs the full Phase 3–8 pipeline against the tab's **live** `document`
 * (inside the network trap, `decisions/0001` / `0009`), then posts the
 * JSON-serializable result back to the service worker. No extraction logic
 * lives here — it just wires the live DOM into `capture()`.
 */
import { capture } from '@technical-clipper/pipeline';
import { CAPTURE_MESSAGE, type InPagePayload } from './shared.js';

function sanitizedPageHtml(doc: Document): string | null {
  try {
    const clone = doc.documentElement.cloneNode(true) as Element;
    for (const el of Array.from(
      clone.querySelectorAll('script, style, template, link[rel="stylesheet"]'),
    )) {
      el.remove();
    }
    const walk = (node: Element): void => {
      for (const attr of Array.from(node.attributes)) {
        const v = attr.value ?? '';
        if (
          attr.name.startsWith('on') ||
          ((attr.name === 'href' || attr.name === 'src') &&
            /^\s*javascript:/i.test(v))
        ) {
          node.removeAttribute(attr.name);
        }
      }
      for (const child of Array.from(node.children)) walk(child);
    };
    walk(clone);
    return `<!doctype html>\n${clone.outerHTML}`;
  } catch {
    return null;
  }
}

function run(): void {
  let payload: InPagePayload;
  try {
    const canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    const result = capture({
      doc: document,
      url: location.href,
      canonicalUrl: canonical?.href ?? null,
    });
    payload = {
      ok: true,
      document: result.document,
      report: result.report,
      export: result.export,
      rawPageHtml: sanitizedPageHtml(document),
      capturedFromUrl: location.href,
    };
  } catch (err) {
    payload = {
      ok: false,
      message: err instanceof Error ? err.message : String(err),
      capturedFromUrl: location.href,
    };
  }
  void chrome.runtime.sendMessage({ type: CAPTURE_MESSAGE, payload });
}

run();
