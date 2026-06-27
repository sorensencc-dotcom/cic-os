import { RoutingRegime } from './RoutingRegimeSelector';
import { RoutingConstraints } from './ConstraintEngine';

export interface MAALRoutingOutput {
  regime: RoutingRegime;
  constraints: RoutingConstraints;
  selectedModel?: string;
}
