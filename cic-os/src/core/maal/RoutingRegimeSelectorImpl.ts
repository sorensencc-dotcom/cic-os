import { RoutingRegimeSelector, RoutingRegime } from './RoutingRegimeSelector';

export class RoutingRegimeSelectorImpl implements RoutingRegimeSelector {
  select(input: unknown): RoutingRegime {
    return 'local_only';
  }
}
