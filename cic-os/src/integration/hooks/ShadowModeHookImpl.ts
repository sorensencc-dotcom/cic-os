import { ShadowModeHook } from './ShadowModeHook';
import { RouteState } from '../../learning/state/RouteState';
import { ShadowDecision } from '../shadow/ShadowRoutingMonitor';
import { ShadowRoutingMonitorImpl } from '../shadow/ShadowRoutingMonitorImpl';
import { ShadowDecisionsWriterImpl } from '../telemetry/ShadowDecisionsWriterImpl';

export class ShadowModeHookImpl implements ShadowModeHook {
  private monitor = new ShadowRoutingMonitorImpl();
  private writer = new ShadowDecisionsWriterImpl();

  onBeforeMAALRoute(state: RouteState): void {
  }

  async onAfterMAALRoute(state: RouteState, decision: ShadowDecision): Promise<void> {
    await this.writer.write(decision);
  }
}
