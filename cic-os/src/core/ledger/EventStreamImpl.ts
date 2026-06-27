import { EventStream } from './EventStream';
import { LedgerEvent } from './LedgerEvent';

export class EventStreamImpl implements EventStream {
  private buffer: LedgerEvent[] = [];

  push(event: LedgerEvent): void {
    this.buffer.push(event);
  }

  drain(batchSize: number): LedgerEvent[] {
    const batch = this.buffer.slice(0, batchSize);
    this.buffer = this.buffer.slice(batchSize);
    return batch;
  }

  size(): number {
    return this.buffer.length;
  }
}
