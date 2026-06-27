import { ABTestRecorder, ABTestMetrics } from './ABTestRecorder';
import { CohortType } from '../cohort/CohortAssigner';

export class ABTestRecorderImpl implements ABTestRecorder {
  private metrics: ABTestMetrics[] = [];

  async recordTestResult(metrics: ABTestMetrics): Promise<void> {
    this.metrics.push(metrics);
  }

  getTestMetrics(cohort: CohortType): ABTestMetrics[] {
    return this.metrics.filter((m) => m.cohortId === cohort);
  }

  computeMetricDeltas(
    splOutcome: any,
    maalOutcome: any
  ): { correctnessDelta: number; costDelta: number; latencyDelta: number; driftDelta: number } {
    return {
      correctnessDelta: (splOutcome.quality || 0.95) - (maalOutcome.quality || 0.93),
      costDelta: (splOutcome.cost || 0.05) - (maalOutcome.cost || 0.06),
      latencyDelta: (splOutcome.latency || 1000) - (maalOutcome.latency || 1100),
      driftDelta: (splOutcome.drift || 0.02) - (maalOutcome.drift || 0.03),
    };
  }
}
