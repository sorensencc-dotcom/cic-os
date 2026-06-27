import { MAALRouter } from './MAALRouter';
import { TaskFingerprint } from './TaskFingerprint';
import { MAALRoutingOutput } from './MAALRoutingOutput';
import { RoutingConstraints } from './ConstraintEngine';

export class MAALRouterImpl implements MAALRouter {
  route(
    fingerprint: TaskFingerprint,
    input: unknown
  ): MAALRoutingOutput {
    const constraints: RoutingConstraints = {
      maxCost: 0.1,
      maxLatencyMs: 5000,
      allowedModels: ['claude-3-5-sonnet', 'claude-opus-4-1'],
      disallowedModels: [],
    };

    return {
      regime: 'local_only',
      constraints,
      selectedModel: 'claude-3-5-sonnet',
    };
  }
}
