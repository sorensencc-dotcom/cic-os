import { Trajectory } from '../episode/Trajectory';
import { RouteState } from '../state/RouteState';
import { RouteAction } from '../action/RouteAction';
import { PolicyNetwork } from './PolicyNetwork';

export interface PolicyGradientConfig {
  learningRate: number;
  discountFactor: number;
  entropyCoefficient: number;
  batchSize: number;
  gradientClipNorm?: number;
}

export interface PolicyGradientLearner {
  train(
    trajectories: Trajectory[],
    config: PolicyGradientConfig
  ): {
    loss: number;
    entropy: number;
    gradientNorm: number;
  };
  selectAction(
    state: RouteState,
    epsilon?: number
  ): RouteAction;
}
