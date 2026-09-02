/**
 * Chrome stripping — remove UI furniture (line-number gutters, copy buttons,
 * language pills, prompt decorations, token-link anchors) from a cloned code
 * element before its text is read. `decisions/0004`, `planning` § 12 gate 10.
 */

/** Selectors for elements that are decoration, not source. */
const CHROME_SELECTORS = [
  '.line-numbers-rows',
  '.line-number',
  '.line-numbers',
  '.ln',
  '.lineno',
  '.gutter',
  '[aria-hidden="true"].line-numbers-rows',
  'button',
  '.copy',
  '.copy-button',
  '.copy-code-button',
  '.copy-to-clipboard-button',
  '[class*="copyButton"]',
  '.code-toolbar > .toolbar',
  '.toolbar',
  '.language-pill',
  '.lang',
  '.code-lang',
  '.token-line-number',
];

/**
 * Return a clone of `el` with chrome removed. The original is untouched
 * (detectors are pure readers — `decisions/0013`).
 */
export function stripChrome(el: Element): Element {
  const clone = el.cloneNode(true) as Element;
  for (const sel of CHROME_SELECTORS) {
    for (const node of Array.from(clone.querySelectorAll(sel))) {
      node.remove();
    }
  }
  // Prompt spans: keep terminal prompts for the terminal detector, but a
  // `.command-line-prompt` gutter (Prism command-line plugin) is decoration.
  for (const node of Array.from(
    clone.querySelectorAll('.command-line-prompt'),
  )) {
    node.remove();
  }
  return clone;
}

/** True if `text` still looks contaminated by chrome the strip missed. */
export function looksContaminated(text: string): boolean {
  // A run of "1\n2\n3\n..." leading each line, or a stray "Copy" / "Copied".
  if (/\bCopied?\b/.test(text) && text.split('\n').length <= 3) return true;
  const lines = text.split('\n');
  let sequential = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]?.trim() === String(i + 1)) sequential++;
  }
  return sequential > 2 && sequential >= lines.length / 2;
}
