export interface LedgerEvent {
  id: string;
  timestamp: number;
  eventType: string;
  data: unknown;
}
