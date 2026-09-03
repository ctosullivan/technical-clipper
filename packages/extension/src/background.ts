/**
 * MV3 service worker — the Clip page action.
 *
 * On click: inject `capture-in-page.js` into the active tab (needs only
 * `activeTab` + `scripting`); it captures and messages the result back, which
 * is stashed in `chrome.storage.session` before the results page opens. No
 * host permissions, no background capture, no capture of a page the user did
 * not click on.
 */
import { CAPTURE_MESSAGE, RESULT_KEY, type InPagePayload } from './shared.js';

chrome.runtime.onMessage.addListener((msg: unknown) => {
  const m = msg as { type?: string; payload?: InPagePayload };
  if (m?.type !== CAPTURE_MESSAGE || !m.payload) return;
  void chrome.storage.session
    .set({ [RESULT_KEY]: m.payload })
    .then(() =>
      chrome.tabs.create({ url: chrome.runtime.getURL('results.html') }),
    );
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.id === undefined) return;
  void chrome.scripting
    .executeScript({
      target: { tabId: tab.id },
      files: ['capture-in-page.js'],
      world: 'ISOLATED',
    })
    .catch(async (err: unknown) => {
      await chrome.storage.session.set({
        [RESULT_KEY]: {
          ok: false,
          message: err instanceof Error ? err.message : String(err),
        } satisfies InPagePayload,
      });
      await chrome.tabs.create({
        url: chrome.runtime.getURL('results.html'),
      });
    });
});
