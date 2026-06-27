import { ABTestMetrics } from '../abt/ABTestRecorder';

export interface ABTestResultsWriter {
  write(metrics: ABTestMetrics): Promise<void>;
  writeBatch(metrics: ABTestMetrics[]): Promise<void>;
  flush(): Promise<void>;
}
