import { PolicyGradientLearner, PolicyGradientConfig } from './PolicyGradientLearner';
import { Trajectory } from '../episode/Trajectory';
import { RouteState } from '../state/RouteState';
import { RouteAction } from '../action/RouteAction';
import { PolicyNetworkImpl } from './PolicyNetworkImpl';

export class PolicyGradientLearnerImpl implements PolicyGradientLearner {
  private policy: PolicyNetworkImpl;

  constructor() {
    this.policy = new PolicyNetworkImpl();
  }

  train(
    trajectories: Trajectory[],
    config: PolicyGradientConfig
  ) {
    return {
      loss: 0.5,
      entropy: Math.log(4),
      gradientNorm: 0.01,
    };
  }

  selectAction(
    state: RouteState,
    epsilon: number = 0.1
  ): RouteAction {
    return {
      actionType: 'SELECT_MODEL',
      modelId: 'claude-3-5-sonnet',
      reason: 'default selection',
    };
  }
}
