/** Constants + types shared between the service worker and the results page. */
import type { CaptureResult } from '@technical-clipper/pipeline';

export const RESULT_KEY = 'tc:last-capture';
export const CAPTURE_MESSAGE = 'tc:capture-result';

export interface InPagePayload {
  ok: boolean;
  message?: string;
  document?: CaptureResult['document'];
  report?: CaptureResult['report'];
  export?: CaptureResult['export'];
  rawPageHtml?: string | null;
  capturedFromUrl?: string;
}
