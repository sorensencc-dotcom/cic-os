/**
 * BrowserNavigateAdapter: Wraps browser.navigate() output
 * Validates: URL format, redirects, final navigation state
 */

import { makeSuccess, makeError, AdapterResponse } from '../validation/envelope';
import { validateFinalUrl } from '../validation/guards';
import { NavigateResultSchema, NavigateResult } from '../validation/schemas';

export class BrowserNavigateAdapter {
  async run(url: string, timeout: number = 30000): Promise<AdapterResponse<NavigateResult>> {
    const startTime = Date.now();
    const adapter = 'BrowserNavigate';

    try {
      // TODO: Call actual browser.navigate(url, timeout)
      // For now, simulate a valid response
      if (!url) {
        return makeError('INVALID_INPUT', { reason: 'url required' }, adapter, startTime);
      }

      const mockResult = {
        url,
        status: 200,
        redirected: false,
      };

      // Validate against schema
      const parsed = NavigateResultSchema.safeParse(mockResult);
      if (!parsed.success) {
        return makeError(
          'INVALID_NAVIGATION_RESULT',
          { reason: 'schema validation failed', errors: parsed.error },
          adapter,
          startTime
        );
      }

      // Guard: validate final URL
      if (!validateFinalUrl(parsed.data.url)) {
        return makeError(
          'INVALID_URL',
          { reason: 'final URL rejected', url: parsed.data.url },
          adapter,
          startTime
        );
      }

      return makeSuccess(parsed.data, adapter, startTime);
    } catch (err) {
      return makeError(
        'NAVIGATION_FAILED',
        { reason: err instanceof Error ? err.message : 'unknown error' },
        adapter,
        startTime
      );
    }
  }
}
