export type RollbackTrigger = 'latency' | 'drift' | 'cost' | 'correctness' | 'rejection_rate' | 'audit_failure' | 'invalid_scaffold';

export interface RollbackSignal {
  triggered: boolean;
  trigger?: RollbackTrigger;
  severity: 'critical' | 'warning' | 'info';
  reason: string;
  timestamp: number;
}

export interface RollbackConfig {
  latencyThresholdMs: number;
  driftThresholdPct: number;
  costThresholdPct: number;
  latencyThresholdPct: number;
  correctnessThresholdPct: number;
  rejectionRateThreshold: number;
}

export interface RollbackMonitor {
  check(metrics: any, config: RollbackConfig): RollbackSignal;
  checkLatency(latencyMs: number, config: RollbackConfig): boolean;
  checkDrift(driftPct: number, config: RollbackConfig): boolean;
  checkCost(costPct: number, config: RollbackConfig): boolean;
  checkLatencyPercentage(latencyPct: number, config: RollbackConfig): boolean;
  checkCorrectness(correctnessPct: number, config: RollbackConfig): boolean;
  checkRejectionRate(rejectionRate: number, config: RollbackConfig): boolean;
}
