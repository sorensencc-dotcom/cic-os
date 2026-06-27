import { LedgerEvent } from './LedgerEvent';

export interface EventStream {
  push(event: LedgerEvent): void;
  drain(batchSize: number): LedgerEvent[];
  size(): number;
}
