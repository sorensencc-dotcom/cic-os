import { RouteState } from '../../learning/state/RouteState';
import { RouteAction } from '../../learning/action/RouteAction';

export interface ShadowDecision {
  taskFingerprint: any;
  splAction: RouteAction;
  maalAction: RouteAction;
  divergenceScore: number;
  splConfidence: number;
  regime: string;
}

export interface ShadowRoutingMonitor {
  runShadowInference(state: RouteState): ShadowDecision;
  computeDivergenceScore(spl: RouteAction, maal: RouteAction): number;
  recordShadowDecision(decision: ShadowDecision): Promise<void>;
  getShadowMetrics(): { divergenceAvg: number; latencyOverhead: number };
}
