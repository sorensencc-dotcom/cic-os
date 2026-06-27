import { TaskFingerprint } from '../../core/maal/TaskFingerprint';
import { RoutingRegime, RoutingConstraints } from '../../core/maal/RoutingRegimeSelector';

export interface RouteState {
  taskFingerprint: TaskFingerprint;
  recentModelPerformance: {
    modelId: string;
    avgLatencyMs: number;
    avgCost: number;
    successRate: number;
    sampleCount: number;
  }[];
  systemLoad: number;
  costBudgetRemaining: number;
  latencyBudgetRemaining: number;
  routingRegime: RoutingRegime;
  constraints: RoutingConstraints;
  stateTimestamp: number;
}

export interface RouteStateFactory {
  build(fingerprint: TaskFingerprint): RouteState;
}
