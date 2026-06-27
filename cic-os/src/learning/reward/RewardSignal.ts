import { RouteState } from '../state/RouteState';
import { RouteAction } from '../action/RouteAction';
import { RouteOutcome } from './RouteOutcome';

export interface RewardComponents {
  latencyReward: number;
  costReward: number;
  successReward: number;
  constraintPenalty: number;
}

export interface RewardSignal {
  totalReward: number;
  components: RewardComponents;
  isTerminal: boolean;
}

export interface RewardFunction {
  compute(
    state: RouteState,
    action: RouteAction,
    outcome: RouteOutcome
  ): RewardSignal;
}
