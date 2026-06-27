import { PromotionMetrics, PromotionDecision } from '../promotion/PolicyPromotionEvaluator';

export interface PromotionAuditRecord {
  checkpointId: string;
  reviewerId: string;
  decision: PromotionDecision;
  justification: string;
  metricsSnapshot: PromotionMetrics;
  timestamp: number;
}

export interface PolicyPromotionAuditWriter {
  write(record: PromotionAuditRecord): Promise<void>;
  writeBatch(records: PromotionAuditRecord[]): Promise<void>;
  flush(): Promise<void>;
}
