import { RewardFunction, RewardSignal, RewardComponents } from './RewardSignal';
import { RouteState } from '../state/RouteState';
import { RouteAction } from '../action/RouteAction';
import { RouteOutcome } from './RouteOutcome';

export class RewardFunctionImpl implements RewardFunction {
  compute(
    state: RouteState,
    action: RouteAction,
    outcome: RouteOutcome
  ): RewardSignal {
    const latencyReward = -Math.min(outcome.actualLatencyMs / 1000, 1);
    const costReward = -outcome.actualCost;
    const successReward = outcome.success ? 1 : -1;
    const constraintPenalty =
      outcome.actualCost > state.constraints.maxCost ? -1 : 0;

    const components: RewardComponents = {
      latencyReward,
      costReward,
      successReward,
      constraintPenalty,
    };

    return {
      totalReward:
        latencyReward + costReward + successReward + constraintPenalty,
      components,
      isTerminal: true,
    };
  }
}
