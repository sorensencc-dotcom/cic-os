import { RouteState, RouteStateFactory } from './RouteState';
import { TaskFingerprint } from '../../core/maal/TaskFingerprint';
import { RoutingRegime } from '../../core/maal/RoutingRegimeSelector';
import { RoutingConstraints } from '../../core/maal/ConstraintEngine';

export class RouteStateFactoryImpl implements RouteStateFactory {
  build(fingerprint: TaskFingerprint): RouteState {
    const constraints: RoutingConstraints = {
      maxCost: 0.1,
      maxLatencyMs: 5000,
      allowedModels: ['claude-3-5-sonnet'],
      disallowedModels: [],
    };

    return {
      taskFingerprint: fingerprint,
      recentModelPerformance: [
        {
          modelId: 'claude-3-5-sonnet',
          avgLatencyMs: 1000,
          avgCost: 0.05,
          successRate: 0.95,
          sampleCount: 100,
        },
      ],
      systemLoad: 0.5,
      costBudgetRemaining: 0.9,
      latencyBudgetRemaining: 0.8,
      routingRegime: 'local_only' as RoutingRegime,
      constraints,
      stateTimestamp: Date.now(),
    };
  }
}
