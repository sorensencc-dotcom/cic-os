import { PolicyPromotionAuditWriter, PromotionAuditRecord } from './PolicyPromotionAuditWriter';

export class PolicyPromotionAuditWriterImpl implements PolicyPromotionAuditWriter {
  private buffer: PromotionAuditRecord[] = [];

  async write(record: PromotionAuditRecord): Promise<void> {
    this.buffer.push(record);
  }

  async writeBatch(records: PromotionAuditRecord[]): Promise<void> {
    this.buffer.push(...records);
  }

  async flush(): Promise<void> {
    this.buffer = [];
  }
}
