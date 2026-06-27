export interface PromotionMetrics {
  shadowDivergence: number;
  shadowLatencyImpact: number;
  abCostImprovement: number;
  abLatencyImprovement: number;
  abCorrectnessImprovement: number;
  holdoutNoOverfit: boolean;
  entropyStable: boolean;
  auditPassed: boolean;
}

export type PromotionDecision = 'approved' | 'rejected' | 'deferred';

export interface PolicyPromotionEvaluator {
  evaluate(metrics: PromotionMetrics): PromotionDecision;
  checkShadowGate(divergence: number, latencyImpact: number): boolean;
  checkABGate(costImprovement: number, latencyImprovement: number, correctnessImprovement: number): boolean;
  checkHoldoutGate(noOverfit: boolean, entropyStable: boolean): boolean;
  checkAuditGate(auditPassed: boolean): boolean;
}
