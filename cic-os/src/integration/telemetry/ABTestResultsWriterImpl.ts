import { ABTestResultsWriter } from './ABTestResultsWriter';
import { ABTestMetrics } from '../abt/ABTestRecorder';

export class ABTestResultsWriterImpl implements ABTestResultsWriter {
  private buffer: ABTestMetrics[] = [];

  async write(metrics: ABTestMetrics): Promise<void> {
    this.buffer.push(metrics);
  }

  async writeBatch(metrics: ABTestMetrics[]): Promise<void> {
    this.buffer.push(...metrics);
  }

  async flush(): Promise<void> {
    this.buffer = [];
  }
}
