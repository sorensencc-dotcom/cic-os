import { ShadowRoutingMonitor, ShadowDecision } from './ShadowRoutingMonitor';
import { RouteState } from '../../learning/state/RouteState';
import { RouteAction } from '../../learning/action/RouteAction';

export class ShadowRoutingMonitorImpl implements ShadowRoutingMonitor {
  private decisions: ShadowDecision[] = [];

  runShadowInference(state: RouteState): ShadowDecision {
    const splAction: RouteAction = {
      actionType: 'SELECT_MODEL',
      modelId: 'claude-3-5-sonnet',
      reason: 'shadow inference',
    };

    const maalAction: RouteAction = {
      actionType: 'SELECT_MODEL',
      modelId: 'claude-3-5-sonnet',
      reason: 'maal routing',
    };

    return {
      taskFingerprint: state.taskFingerprint,
      splAction,
      maalAction,
      divergenceScore: 0.08,
      splConfidence: 0.92,
      regime: state.routingRegime,
    };
  }

  computeDivergenceScore(spl: RouteAction, maal: RouteAction): number {
    if (spl.modelId === maal.modelId) return 0.0;
    return 0.5;
  }

  async recordShadowDecision(decision: ShadowDecision): Promise<void> {
    this.decisions.push(decision);
  }

  getShadowMetrics(): { divergenceAvg: number; latencyOverhead: number } {
    const divergences = this.decisions.map((d) => d.divergenceScore);
    const divergenceAvg = divergences.length > 0 ? divergences.reduce((a, b) => a + b, 0) / divergences.length : 0;
    return {
      divergenceAvg,
      latencyOverhead: 5,
    };
  }
}
