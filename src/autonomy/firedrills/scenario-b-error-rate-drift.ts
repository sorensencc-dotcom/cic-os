/**
 * WS-B Scenario B3: Error-Rate Drift Gate
 * Injects long-window error-rate above SLO, verifies abort + rollback
 */

import { sloController } from "../../slo-controller/slo-controller";
import { canaryEventBus } from "../../slo-controller/canary-signals";

export interface ErrorRateDriftReport {
  startedAt: number;
  completedAt: number;
  abortTriggered: boolean;
  rollbackCompleted: boolean;
  rollbackMs: number | null;
}

let errorRateDriftRollbackMs: number | null = null;

canaryEventBus.onRollbackComplete((signal) => {
  const rollbackStart = signal.context?.rollbackStart ?? signal.timestamp;
  errorRateDriftRollbackMs = signal.timestamp - rollbackStart;
});

export async function runErrorRateDriftGate(): Promise<ErrorRateDriftReport> {
  const startedAt = Date.now();
  errorRateDriftRollbackMs = null;

  // Inject error-rate: 30m window at 1% (3x threshold of 0.3%)
  sloController.setMetrics({
    slo_error_rate_1m: 0.005,
    slo_error_rate_5m: 0.008,
    slo_error_rate_30m: 0.01,
  });

  // Wait for enforcement to evaluate and react
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const status = sloController.getCanaryGateStatus();
  const abortTriggered = status.violations > 0;

  const completedAt = Date.now();

  return {
    startedAt,
    completedAt,
    abortTriggered,
    rollbackCompleted: errorRateDriftRollbackMs !== null,
    rollbackMs: errorRateDriftRollbackMs,
  };
}
