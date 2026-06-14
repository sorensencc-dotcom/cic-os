import fetch from 'node-fetch';
import { Logger } from '../utils/Logger';
import { CircuitBreaker } from '../utils/CircuitBreaker';

export interface MailpitPoolConfig {
  baseUrl: string;
  timeout_ms: number;
  maxConnections: number;
  maxRetries: number;
  retryBackoffMs: number;
  healthCheckIntervalMs: number;
  circuitBreakerThreshold: number;
  circuitBreakerResetMs: number;
  pollIntervalMs: number;
  maxMessagesPerPoll: number;
}

export interface MailpitMessage {
  id: string;
  from: { address: string; name: string };
  to: { address: string; name: string }[];
  cc?: { address: string; name: string }[];
  subject: string;
  text: string;
  html?: string;
  inReplyTo?: string;
  messageId: string;
  date: string;
  attachments: MailpitAttachment[];
  read: boolean;
  tags: string[];
}

export interface MailpitAttachment {
  partID: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export class MailpitClient {
  private config: MailpitPoolConfig;
  private logger: Logger;
  private circuitBreaker: CircuitBreaker;
  private lastHealthCheck: number = 0;
  private polling: boolean = false;
  private pollInterval: NodeJS.Timer;

  constructor(config: MailpitPoolConfig) {
    this.config = config;
    this.logger = new Logger('MailpitClient');
    this.circuitBreaker = new CircuitBreaker(
      config.circuitBreakerThreshold,
      config.circuitBreakerResetMs
    );
  }

  async connect(): Promise<void> {
    try {
      const response = await this.fetch(`${this.config.baseUrl}/api/v1/info`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`API unreachable: ${response.status}`);
      }

      this.circuitBreaker.recordSuccess();
      this.lastHealthCheck = Date.now();
      this.logger.info('Connected to Mailpit API');
    } catch (err) {
      this.circuitBreaker.recordFailure();
      throw new Error(`Failed to connect to Mailpit: ${err.message}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    if (this.circuitBreaker.isOpen()) {
      this.logger.warn('Circuit breaker is open');
      return false;
    }

    if (Date.now() - this.lastHealthCheck < this.config.healthCheckIntervalMs) {
      return true;
    }

    try {
      await this.connect();
      return true;
    } catch (err) {
      this.logger.error(`Health check failed: ${err.message}`);
      return false;
    }
  }

  startPolling(onMessages: (messages: MailpitMessage[]) => Promise<void>): PollingHandle {
    if (this.polling) {
      throw new Error('Polling already started');
    }

    this.polling = true;
    this.logger.info(`Starting poll loop (interval: ${this.config.pollIntervalMs}ms)`);

    this.pollInterval = setInterval(async () => {
      try {
        await this.pollOnce(onMessages);
      } catch (err) {
        this.logger.error(`Poll cycle failed: ${err.message}`);
      }
    }, this.config.pollIntervalMs);

    return {
      stop: () => this.stopPolling(),
    };
  }

  private async pollOnce(onMessages: (messages: MailpitMessage[]) => Promise<void>): Promise<void> {
    const isHealthy = await this.healthCheck();
    if (!isHealthy) {
      this.logger.warn('Mailpit unreachable, skipping poll');
      return;
    }

    try {
      const messages = await this.retryWithBackoff(
        () => this.fetchMessages(),
        3,
        [500, 1000, 2000]
      );

      if (messages.length === 0) {
        this.logger.debug('No new messages');
        return;
      }

      this.logger.info(`Fetched ${messages.length} new messages`);
      await onMessages(messages);
    } catch (err) {
      this.logger.error(`Poll failed: ${err.message}`);
    }
  }

  private async fetchMessages(): Promise<MailpitMessage[]> {
    const url = new URL(`${this.config.baseUrl}/api/v1/messages`);
    url.searchParams.set('limit', this.config.maxMessagesPerPoll.toString());
    url.searchParams.set('search', 'is:unread');

    const response = await this.fetch(url.toString(), { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.status}`);
    }

    const data = (await response.json()) as { messages?: MailpitMessage[] };
    return data.messages || [];
  }

  async downloadAttachment(messageId: string, partId: string): Promise<Buffer> {
    const url = `${this.config.baseUrl}/api/v1/message/${messageId}/part/${partId}/download`;
    const response = await this.fetch(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Failed to download attachment: ${response.status}`);
    }

    return response.buffer();
  }

  async markMessageRead(messageId: string): Promise<void> {
    const url = `${this.config.baseUrl}/api/v1/message/${messageId}`;
    const response = await this.fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true }),
    });

    if (!response.ok) {
      throw new Error(`Failed to mark message read: ${response.status}`);
    }
  }

  private stopPolling(): void {
    if (this.polling) {
      this.polling = false;
      clearInterval(this.pollInterval);
      this.logger.info('Poll loop stopped');
    }
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxAttempts: number,
    backoffMs: number[]
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        const isRetryable = this.isRetryableError(err);

        if (!isRetryable) {
          throw err;
        }

        if (attempt < maxAttempts) {
          const delay = backoffMs[Math.min(attempt - 1, backoffMs.length - 1)];
          this.logger.warn(
            `Attempt ${attempt} failed, retrying in ${delay}ms: ${err.message}`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  private isRetryableError(err: any): boolean {
    const retryable = ['ECONNREFUSED', 'ETIMEDOUT', '503', '429'];
    const message = err.message || '';
    return retryable.some((code) => message.includes(code));
  }

  private async fetch(url: string, init: any): Promise<any> {
    try {
      return await Promise.race([
        fetch(url, init),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Request timeout')),
            this.config.timeout_ms
          )
        ),
      ]);
    } catch (err) {
      throw err;
    }
  }
}

export interface PollingHandle {
  stop: () => void;
}
