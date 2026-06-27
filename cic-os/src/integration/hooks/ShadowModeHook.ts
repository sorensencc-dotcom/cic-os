import { RouteState } from '../../learning/state/RouteState';
import { ShadowDecision } from '../shadow/ShadowRoutingMonitor';

export interface ShadowModeHook {
  onBeforeMAALRoute(state: RouteState): void;
  onAfterMAALRoute(state: RouteState, decision: ShadowDecision): Promise<void>;
}
