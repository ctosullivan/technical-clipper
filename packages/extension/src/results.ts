/**
 * The results page controller.
 *
 * Reads the stashed capture from `chrome.storage.session`, renders the
 * completeness report + a Markdown preview, and wires the export actions
 * (`decisions/0015` gate, `decisions/0019` profiles).
 */
import {
  assembleBundle,
  renderMarkdown,
  type CompletenessReport,
  type DocumentIR,
  type MarkdownProfile,
} from '@technical-clipper/core';
import { gateFor } from './gate.js';
import { planObsidianHandoff } from './obsidian.js';
import { RESULT_KEY, type InPagePayload } from './shared.js';

type StoredCapture = InPagePayload;

const $ = <T extends HTMLElement>(id: string): T =>
  document.getElementById(id) as T;

function text(el: HTMLElement, s: string): void {
  el.textContent = s;
}

async function main(): Promise<void> {
  const stored = (await chrome.storage.session.get(RESULT_KEY))[RESULT_KEY] as
    StoredCapture | undefined;

  if (!stored || !stored.ok || !stored.document || !stored.report) {
    text($('headline'), 'Capture failed');
    text($('reason'), stored?.message ?? 'No capture data was found.');
    $('actions').hidden = true;
    return;
  }

  const doc = stored.document;
  const report = stored.report;
  const gate = gateFor(report);

  text($('headline'), gate.headline);
  text($('reason'), report.reason);

  const banner = $('warning-banner');
  banner.hidden = !gate.showWarningBanner;
  if (gate.showWarningBanner) {
    text(banner, report.warnings.join(' • ') || report.reason);
  }

  renderReport(report);

  let profile: MarkdownProfile = 'obsidian';
  const preview = $<HTMLPreElement>('preview');
  const rerender = (): string => {
    const md = renderMarkdown(doc, { profile }).markdown;
    text(preview, md); // <pre> textContent — never interpreted as HTML
    return md;
  };
  rerender();

  $<HTMLSelectElement>('profile').addEventListener('change', (e) => {
    profile = (e.target as HTMLSelectElement).value as MarkdownProfile;
    rerender();
  });

  const actions = $('actions');
  actions.hidden = !gate.canExport;
  if (!gate.canExport) return;

  $('copy').addEventListener('click', async () => {
    await navigator.clipboard.writeText(
      renderMarkdown(doc, { profile: 'gfm' }).markdown,
    );
    flash($('copy'), 'Copied');
  });

  $('obsidian').addEventListener('click', () => {
    const md = renderMarkdown(doc, { profile: 'obsidian' }).markdown;
    const plan = planObsidianHandoff(md, { title: doc.source.title });
    if (plan.method === 'uri' && plan.uri) {
      location.href = plan.uri;
    } else {
      text($('obsidian-note'), plan.reason ?? 'Obsidian handoff unavailable.');
      $('obsidian-note').hidden = false;
    }
  });

  $('download').addEventListener('click', () => {
    const includeRaw = $<HTMLInputElement>('raw-toggle').checked;
    const bundle = assembleBundle(doc, {
      profile,
      rawPageHtml: stored.rawPageHtml ?? null,
      includeRawHtml: includeRaw,
    });
    const blob = new Blob([bundle.zip.slice().buffer as ArrayBuffer], {
      type: 'application/zip',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${slug(doc)}.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  // Raw HTML default: on for articles, off for conversations (decisions/0017).
  $<HTMLInputElement>('raw-toggle').checked =
    doc.captureKind !== 'conversation';
}

function renderReport(report: CompletenessReport): void {
  const rows: [string, string][] = [
    ['Status', report.status],
    [
      'Code',
      `${report.code.detected} detected — ${report.code.exact} exact, ${report.code.approximate} approximate, ${report.code.failed} failed`,
    ],
    [
      'Citations',
      `${report.citations.resolved} / ${report.citations.total} resolved`,
    ],
  ];
  if (report.sections.expected > 0) {
    rows.push([
      'Sections',
      `${report.sections.kept} / ${report.sections.expected} kept`,
    ]);
  }
  const dl = $('report');
  dl.innerHTML = '';
  for (const [k, v] of rows) {
    const dt = document.createElement('dt');
    dt.textContent = k;
    const dd = document.createElement('dd');
    dd.textContent = v;
    dl.append(dt, dd);
  }
  const warnList = $('warnings');
  warnList.innerHTML = '';
  for (const w of report.warnings) {
    const li = document.createElement('li');
    li.textContent = w;
    warnList.append(li);
  }
}

function flash(btn: HTMLElement, label: string): void {
  const original = btn.textContent;
  btn.textContent = label;
  setTimeout(() => {
    btn.textContent = original;
  }, 1200);
}

function slug(doc: DocumentIR): string {
  return (doc.source.title ?? 'capture')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);
}

void main();
