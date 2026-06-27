import { RouteState } from '../../learning/state/RouteState';
import { RouteAction } from '../../learning/action/RouteAction';

export interface ABTestHookContext {
  cohort: 'control' | 'treatment';
  state: RouteState;
  splAction?: RouteAction;
  maalAction: RouteAction;
}

export interface ABTestHook {
  onAssignCohort(state: RouteState): 'control' | 'treatment';
  onRecordMetrics(context: ABTestHookContext): Promise<void>;
}
