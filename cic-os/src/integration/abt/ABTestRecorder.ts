import { CohortType } from '../cohort/CohortAssigner';

export interface ABTestMetrics {
  cohortId: CohortType;
  splAction: any;
  maalAction: any;
  correctnessDelta: number;
  costDelta: number;
  latencyDelta: number;
  driftDelta: number;
  timestamp: number;
}

export interface ABTestRecorder {
  recordTestResult(metrics: ABTestMetrics): Promise<void>;
  getTestMetrics(cohort: CohortType): ABTestMetrics[];
  computeMetricDeltas(splOutcome: any, maalOutcome: any): { correctnessDelta: number; costDelta: number; latencyDelta: number; driftDelta: number };
}
