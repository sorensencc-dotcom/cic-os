import { ConstraintEngine, RoutingConstraints } from './ConstraintEngine';

export class ConstraintEngineImpl implements ConstraintEngine {
  derive(input: unknown): RoutingConstraints {
    return {
      maxCost: 0.1,
      maxLatencyMs: 5000,
      allowedModels: ['claude-3-5-sonnet', 'claude-opus-4-1'],
      disallowedModels: [],
    };
  }
}
