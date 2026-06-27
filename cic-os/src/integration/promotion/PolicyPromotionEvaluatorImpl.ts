import { PolicyPromotionEvaluator, PromotionMetrics, PromotionDecision } from './PolicyPromotionEvaluator';

export class PolicyPromotionEvaluatorImpl implements PolicyPromotionEvaluator {
  private shadowDivergenceThreshold = 0.15;
  private shadowLatencyThreshold = 0.05;
  private abCostThreshold = 0.05;
  private abLatencyThreshold = 0.05;
  private abCorrectnessThreshold = 0.02;

  evaluate(metrics: PromotionMetrics): PromotionDecision {
    if (!this.checkShadowGate(metrics.shadowDivergence, metrics.shadowLatencyImpact)) return 'rejected';
    if (!this.checkABGate(metrics.abCostImprovement, metrics.abLatencyImprovement, metrics.abCorrectnessImprovement))
      return 'rejected';
    if (!this.checkHoldoutGate(metrics.holdoutNoOverfit, metrics.entropyStable)) return 'rejected';
    if (!this.checkAuditGate(metrics.auditPassed)) return 'rejected';

    return 'approved';
  }

  checkShadowGate(divergence: number, latencyImpact: number): boolean {
    return divergence < this.shadowDivergenceThreshold && latencyImpact < this.shadowLatencyThreshold;
  }

  checkABGate(costImprovement: number, latencyImprovement: number, correctnessImprovement: number): boolean {
    return (
      costImprovement > this.abCostThreshold &&
      latencyImprovement > this.abLatencyThreshold &&
      correctnessImprovement > this.abCorrectnessThreshold
    );
  }

  checkHoldoutGate(noOverfit: boolean, entropyStable: boolean): boolean {
    return noOverfit && entropyStable;
  }

  checkAuditGate(auditPassed: boolean): boolean {
    return auditPassed;
  }
}
