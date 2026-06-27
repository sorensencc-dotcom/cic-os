import { PolicyNetwork, PolicyNetworkWeights } from './PolicyNetwork';
import { RouteState } from '../state/RouteState';

export class PolicyNetworkImpl implements PolicyNetwork {
  private weights: PolicyNetworkWeights;
  private stateSpaceDim = 10;
  private actionSpaceDim = 4;

  constructor() {
    this.weights = {
      version: 'π_v0',
      parameters: {},
      trainedAt: Date.now(),
      trainingIterations: 0,
    };
  }

  forward(state: RouteState) {
    const logits = Array(this.actionSpaceDim).fill(0.25);
    return {
      actionLogits: logits,
      entropy: Math.log(this.actionSpaceDim),
    };
  }

  updateWeights(gradient: Record<string, unknown>): void {
    this.weights.trainingIterations++;
  }

  getWeights(): PolicyNetworkWeights {
    return this.weights;
  }

  loadWeights(weights: PolicyNetworkWeights): void {
    this.weights = weights;
  }
}
