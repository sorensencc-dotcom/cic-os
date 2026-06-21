/**
 * AnthropicClient: Wraps Anthropic API response
 * Validates: response structure, text content, stop reason
 */

import { makeSuccess, makeError, AdapterResponse } from '../validation/envelope';
import { sanitizeText, validateTextLength } from '../validation/guards';
import { AnthropicResultSchema, AnthropicResult } from '../validation/schemas';

export class AnthropicClient {
  async run(
    messages: Array<{ role: string; content: string }>,
    options?: { model?: string; maxTokens?: number }
  ): Promise<AdapterResponse<AnthropicResult>> {
    const startTime = Date.now();
    const adapter = 'AnthropicClient';

    try {
      if (!messages || messages.length === 0) {
        return makeError('INVALID_INPUT', { reason: 'messages required' }, adapter, startTime);
      }

      // TODO: Call actual Anthropic API via fetch or SDK
      // For now, simulate a valid response
      const mockResult = {
        text: 'Anthropic response text',
        stopReason: 'end_turn',
      };

      // Validate against schema
      const parsed = AnthropicResultSchema.safeParse(mockResult);
      if (!parsed.success) {
        return makeError(
          'ANTHROPIC_INVALID_RESPONSE',
          { reason: 'schema validation failed', errors: parsed.error },
          adapter,
          startTime
        );
      }

      // Guard: reject empty responses
      if (!parsed.data.text || parsed.data.text.trim().length === 0) {
        return makeError(
          'ANTHROPIC_EMPTY_RESPONSE',
          { reason: 'API returned empty response' },
          adapter,
          startTime
        );
      }

      let text = parsed.data.text;

      // Guard: sanitize text
      text = sanitizeText(text);

      // Guard: validate length
      if (!validateTextLength(text)) {
        return makeError(
          'ANTHROPIC_OVERSIZE_OUTPUT',
          { reason: 'response exceeds size limits', length: text.length },
          adapter,
          startTime
        );
      }

      const result: AnthropicResult = {
        text,
        stopReason: parsed.data.stopReason,
      };

      return makeSuccess(result, adapter, startTime);
    } catch (err) {
      return makeError(
        'ANTHROPIC_API_ERROR',
        { reason: err instanceof Error ? err.message : 'unknown error' },
        adapter,
        startTime
      );
    }
  }
}
