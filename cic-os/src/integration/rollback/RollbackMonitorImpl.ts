import { RollbackMonitor, RollbackSignal, RollbackConfig } from './RollbackMonitor';

export class RollbackMonitorImpl implements RollbackMonitor {
  check(metrics: any, config: RollbackConfig): RollbackSignal {
    if (this.checkLatency(metrics.latencyMs, config)) {
      return {
        triggered: true,
        trigger: 'latency',
        severity: 'critical',
        reason: 'SPL inference latency exceeded threshold',
        timestamp: Date.now(),
      };
    }

    if (this.checkDrift(metrics.driftPct, config)) {
      return {
        triggered: true,
        trigger: 'drift',
        severity: 'warning',
        reason: 'Drift increase exceeded threshold',
        timestamp: Date.now(),
      };
    }

    if (this.checkCost(metrics.costPct, config)) {
      return {
        triggered: true,
        trigger: 'cost',
        severity: 'warning',
        reason: 'Cost increase exceeded threshold',
        timestamp: Date.now(),
      };
    }

    return {
      triggered: false,
      severity: 'info',
      reason: 'No rollback triggers detected',
      timestamp: Date.now(),
    };
  }

  checkLatency(latencyMs: number, config: RollbackConfig): boolean {
    return latencyMs > config.latencyThresholdMs;
  }

  checkDrift(driftPct: number, config: RollbackConfig): boolean {
    return driftPct > config.driftThresholdPct;
  }

  checkCost(costPct: number, config: RollbackConfig): boolean {
    return costPct > config.costThresholdPct;
  }

  checkLatencyPercentage(latencyPct: number, config: RollbackConfig): boolean {
    return latencyPct > config.latencyThresholdPct;
  }

  checkCorrectness(correctnessPct: number, config: RollbackConfig): boolean {
    return correctnessPct < config.correctnessThresholdPct;
  }

  checkRejectionRate(rejectionRate: number, config: RollbackConfig): boolean {
    return rejectionRate > config.rejectionRateThreshold;
  }
}
